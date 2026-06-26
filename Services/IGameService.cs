using NumberGuessGameApi.DataTransferObjects;

namespace NumberGuessGameApi.Services;

public interface IGameService
{
    Task<RegisterPlayerResponse> RegisterPlayerAsync(RegisterPlayerRequest request);
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<StartGameResponse> StartGameAsync(Guid playerId);
    Task<GuessNumberResponse> GuessNumberAsync(GuessNumberRequest request);
}