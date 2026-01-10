# MVP Requirements

## Purpose & Scope

The George Street Rummy Scorekeeper is a mobile-first web app designed to make keeping score for George Street Rummy faster, clearer, and more enjoyable than using paper. The app focuses on simplicity, clarity, and offline-first use.

	•	One device manages the game
	•	One active game exists at a time
	•	Data is stored locally and persists across browser refreshes
	•	No internet connection is required

## Game Setup

### Players

	•	Players are added at game start
	•	Player identity is free-text (name, nickname, or initials)
	•	There is no hard limit on the number of players
	•	Players cannot be removed once the game starts
	•	Players may be skipped for individual rounds or all future rounds

### Rounds

	•	The game consists of seven rounds, played in a fixed order:
	1.	2 books
	2.	1 book 1 run
	3.	2 runs
	4.	2 books 1 run
	5.	2 runs 1 book
	6.	3 books
	7.	3 runs and out
	•	Each round appears in the UI regardless of whether it is played or skipped
	•	A round may be explicitly skipped by all players and locked with null scores

## Score Entry & Validation

### Score Input

	•	Scores are entered as numeric values
	•	Default score value is 0
	•	Valid scores:
	•	Greater than or equal to 0
	•	In increments of 5
	•	Maximum score of 300
	•	The app does not calculate scores; it only validates and records them

### Per-Round Rules

	•	Exactly one player must have a score of 0 for a round
	•	Multiple zero scores are not allowed
	•	A round cannot be completed unless:
	•	Every non-skipped player has a score
	•	All scores are valid
	•	Exactly one zero score exists

### Skipping Players

	•	When entering scores for a round, the UI must offer:
	•	“Skip player for this round”
	•	“Skip player in all future rounds”
	•	Skipped players for a round have a null score (displayed as a dash)
	•	Players skipped for all future rounds:
	•	Continue to appear in standings
	•	Do not receive scores for skipped rounds

## Round Lifecycle

	•	Each round supports:
	•	Editing scores
	•	Explicit Lock Round action
	•	Explicit Unlock Round action (with confirmation)
	•	Scores update totals after the round is locked
	•	A user cannot advance to the next round unless the current round is valid
	•	Locked rounds are read-only unless explicitly unlocked

## Game Progress & Visibility

### During the Game

	•	Users can view:
	•	Current total scores
	•	Scores by round, per player
	•	The UI should not emphasize an overall winner until the game ends
	•	Round winners are implicitly indicated by the zero score

### Orientation-Based Views

	•	Portrait mode:
	•	  Summary view
	•	  Current player rankings with total scores
	•	Landscape mode:
	•	  Detailed scorecard
	•	  Players vs. rounds grid, including skipped rounds

## Ending the Game

	•	The game ends only when:
	•	All rounds are locked
	•	The user explicitly selects End Game
	•	“End Game” behaves like a lock:
	•	It can be undone
	•	The game can return to an editable state

### Final Results

	•	Players are ranked from lowest to highest total score
	•	Ties are allowed
	•	Each player’s total score is shown next to their name
	•	Users can toggle between:
	•	Final ranking summary
	•	Full scorecard with all rounds and players
	•	Players who skipped one or more rounds must be clearly indicated if round-level detail is not visible

## UX & Tone

	•	Mobile-first, touch-friendly design
	•	Generous button sizes and readable text
	•	Minimal but fun visual style
	•	Light, friendly validation messages
	•	Subtle feedback where it adds clarity or delight
	•	The full game name “George Street Rummy” should appear in the UI without heavy emphasis
