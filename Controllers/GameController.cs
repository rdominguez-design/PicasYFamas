using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NumberGuessGameApi.DataTransferObjects;
using NumberGuessGameApi.Services;
using System.Security.Claims;

namespace NumberGuessGameApi.Controllers;

[ApiController]
[Route("api/game/v1")]
public class GameController : ControllerBase
{
    private readonly IGameService _gameService;
    private readonly ILogger<GameController> _logger;

    public GameController(IGameService gameService, ILogger<GameController> logger)
    {
        _gameService = gameService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterPlayerRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FirstName) ||
            string.IsNullOrWhiteSpace(request.LastName) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            request.Age <= 0)
            return BadRequest(new { message = "Todos los campos son requeridos." });

        try
        {
            var result = await _gameService.RegisterPlayerAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar jugador.");
            return StatusCode(500, new { message = "Error interno del servidor." });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Email y contraseña son requeridos." });

        try
        {
            var result = await _gameService.LoginAsync(request);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al hacer login.");
            return StatusCode(500, new { message = "Error interno del servidor." });
        }
    }

    [Authorize]
    [HttpPost("start")]
    public async Task<IActionResult> StartGame()
    {
        try
        {
            var playerIdClaim = User.FindFirst("playerId")?.Value;
            if (playerIdClaim == null)
                return Unauthorized(new { message = "Token inválido." });
            var playerId = Guid.Parse(playerIdClaim);
            var result = await _gameService.StartGameAsync(playerId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al iniciar juego.");
            return StatusCode(500, new { message = "Error interno del servidor." });
        }
    }

    [Authorize]
    [HttpPost("guess")]
    public async Task<IActionResult> Guess([FromBody] GuessNumberRequest request)
    {
        if (request.GameId <= 0 || string.IsNullOrWhiteSpace(request.AttemptedNumber))
            return BadRequest(new { message = "GameId y número son requeridos." });

        try
        {
            var result = await _gameService.GuessNumberAsync(request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al procesar intento.");
            return StatusCode(500, new { message = "Error interno del servidor." });
        }
    }
}