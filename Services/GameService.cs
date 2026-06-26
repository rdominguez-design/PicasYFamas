using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using NumberGuessGameApi.Data;
using NumberGuessGameApi.DataTransferObjects;
using NumberGuessGameApi.Models;
using GameCore;

namespace NumberGuessGameApi.Services;

public class GameService : IGameService
{
    private readonly GameDbContext _context;
    private readonly ILogger<GameService> _logger;
    private readonly IConfiguration _config;

    public GameService(GameDbContext context, ILogger<GameService> logger, IConfiguration config)
    {
        _context = context;
        _logger = logger;
        _config = config;
    }

    public async Task<RegisterPlayerResponse> RegisterPlayerAsync(RegisterPlayerRequest request)
    {
        _logger.LogInformation("Registrando jugador: {Email}", request.Email);

        var existing = await _context.Players.FirstOrDefaultAsync(p => p.Email == request.Email);
        if (existing != null)
            throw new InvalidOperationException("El correo ya está registrado.");

        var player = new Player
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Age = request.Age,
            Email = request.Email,
            PasswordHash = HashPassword(request.Password)
        };

        _context.Players.Add(player);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Jugador registrado con ID: {Id}", player.Id);
        var token = GenerateJwtToken(player);
        return new RegisterPlayerResponse { Token = token };
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        _logger.LogInformation("Login intento: {Email}", request.Email);

        var player = await _context.Players.FirstOrDefaultAsync(p => p.Email == request.Email);
        if (player == null || player.PasswordHash != HashPassword(request.Password))
            throw new UnauthorizedAccessException("Credenciales incorrectas.");

        var token = GenerateJwtToken(player);
        return new LoginResponse { Token = token };
    }

    public async Task<StartGameResponse> StartGameAsync(Guid playerId)
    {
        _logger.LogInformation("Iniciando juego para jugador ID: {PlayerId}", playerId);

        var player = await _context.Players.FindAsync(playerId)
            ?? throw new KeyNotFoundException("Jugador no encontrado.");

        var activeGame = await _context.Games
            .FirstOrDefaultAsync(g => g.PlayerId == playerId && !g.IsFinished);

        if (activeGame != null)
            throw new InvalidOperationException("Ya tenés un juego activo. Terminalo antes de empezar uno nuevo.");

        var secret = GenerateSecretNumber();
        var game = new Game { PlayerId = playerId, SecretNumber = secret };

        _context.Games.Add(game);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Juego {GameId} iniciado.", game.Id);
        return new StartGameResponse { GameId = game.Id, PlayerId = game.PlayerId, CreatedAt = game.CreatedAt };

    }

    public async Task<GuessNumberResponse> GuessNumberAsync(GuessNumberRequest request)
    {
        _logger.LogInformation("Intento para juego ID: {GameId}", request.GameId);

        var game = await _context.Games.FindAsync(request.GameId)
            ?? throw new KeyNotFoundException("Juego no encontrado.");

        if (game.IsFinished)
            throw new InvalidOperationException($"El juego {request.GameId} ya ha finalizado.");

        if (request.AttemptedNumber.Length != 4 || request.AttemptedNumber.Distinct().Count() != 4)
            throw new ArgumentException("El número debe tener exactamente 4 dígitos sin repetir.");

        // Usar ESCMB.GameCore
        var resultado = Evaluator.ValidateAttempt(
            game.SecretNumber, 
            request.AttemptedNumber);

        if (resultado.Fama == 4)
            game.IsFinished = true;

        var attempt = new Attempt
        {
            GameId = game.Id,
            AttemptedNumber = request.AttemptedNumber,
            Famas = resultado.Fama,
            Picas = resultado.Pica
        };

        _context.Attempts.Add(attempt);
        await _context.SaveChangesAsync();

        return new GuessNumberResponse
        {
            GameId = game.Id,
            AttemptedNumber = request.AttemptedNumber,
            Message = resultado.Message
        };
    }

    private string GenerateJwtToken(Player player)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("playerId", player.Id.ToString()),
            new Claim(ClaimTypes.Email, player.Email),
            new Claim(ClaimTypes.Name, player.FirstName)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes);
    }

    private static string GenerateSecretNumber()
    {
        var digits = Enumerable.Range(0, 10).OrderBy(_ => Guid.NewGuid()).Take(4).ToList();
        return string.Concat(digits);
    }
}