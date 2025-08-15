package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/mezleca/hub/backend/internal/api"
	"github.com/mezleca/hub/backend/internal/api/repo"
	"github.com/mezleca/hub/backend/internal/api/services"
)

func main() {
	// load env variables
	err := godotenv.Load()

	if err != nil {
		log.Fatal("failed to load env")
	}

	// create all temp folders
	// @TODO: remove old temp files
	os.MkdirAll(services.TEMP_UPLOAD_LOCATION, 0777)

	// create all caches
	services.CreateCache()

	// initialize storage database
	repo.InitializeS3()

	// initialize http server
	api.Initialize()
}
