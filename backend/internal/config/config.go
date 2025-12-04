package config

import (
	"log"
	"time"

	"github.com/ilyakaznacheev/cleanenv"
)

type Config struct {
	LogLevel   string     `yaml:"log_level"`
	PortName   string     `yaml:"port_name"`
	HTTPConfig HTTPConfig `yaml:"http_config"`
}

type HTTPConfig struct {
	Address string        `yaml:"address"`
	Timeout time.Duration `yaml:"timeout"`
}

func MustLoad(configPath string) Config {
	var cfg Config
	if err := cleanenv.ReadConfig(configPath, &cfg); err != nil {
		log.Fatalf("cannot read config %q: %s", configPath, err)
	}
	return cfg
}
