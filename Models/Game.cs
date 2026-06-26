namespace NumberGuessGameApi.Models;

public class Game
{
    public int Id { get; set; }
    public Guid PlayerId { get; set; }
    public Player Player { get; set; } = null!;
    public string SecretNumber { get; set; } = string.Empty;
    public bool IsFinished { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Attempt> Attempts { get; set; } = new List<Attempt>();
}