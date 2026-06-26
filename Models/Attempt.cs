namespace NumberGuessGameApi.Models
{
    public class Attempt
    {
        public int Id { get; set; }
        public int GameId { get; set; }
        public Game Game { get; set; } = null!;
        public string AttemptedNumber { get; set; } = string.Empty;
        public int Famas { get; set; }
        public int Picas { get; set; }
        public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
    }
}
