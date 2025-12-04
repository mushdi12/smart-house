package core

type Fanner interface {
	TurnOnFan() (string, error)
	TurnOffFan() (string, error)
}
