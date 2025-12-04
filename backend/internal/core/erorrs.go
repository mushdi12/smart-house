package core

import "errors"

var ErrTurnOnFan = errors.New("failed to turn on fan")
var ErrTurnOffFan = errors.New("failed to turn off fan")
var ErrGetFanStatus = errors.New("failed to get fan status")
var ErrSetFanPower = errors.New("failed to set fan power")
var ErrSetFanMode = errors.New("failed to set fan mode")
var ErrSetFanDuration = errors.New("failed to set fan duration")
