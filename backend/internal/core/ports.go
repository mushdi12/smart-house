package core

type Fanner interface {
	TurnOnFan() (string, error)
	TurnOffFan() (string, error)
}

type Lightner interface {
	TurnOnLamp() (string, error)
	TurnOffLamp() (string, error)
}