namespace NumberGuessGameApi.DataTransferObjects;

public class GuessNumberRequest
{
    public int GameId { get; set; }
    public string AttemptedNumber { get; set; } = string.Empty;
}