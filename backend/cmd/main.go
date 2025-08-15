package main

import (
	"log"

	"github.com/joho/godotenv"
	"github.com/mezleca/hub/backend/internal/api"
	"github.com/mezleca/hub/backend/internal/api/repo"
)

func main() {
	// load env variables
	err := godotenv.Load()

	if err != nil {
		log.Fatal("failed to load env")
	}

	// initialize storage database
	repo.InitializeS3()

	// initialize http server
	api.Initialize()
}
