namespace NumberGuessGameApi.DataTransferObjects;

public class StartGameResponse
{
    public int GameId { get; set; }
    public Guid PlayerId { get; set; }
    public DateTime CreatedAt { get; set; }
}