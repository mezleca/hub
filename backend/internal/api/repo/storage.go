package repo

import (
	"context"
	"log"
	"os"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var (
	ctx       context.Context
	minClient *minio.Client
)

// @TODO: check if we're on prod mode
// if so: use aws stuff and also test
func InitializeS3() {
	ctx = context.Background()

	endpoint := os.Getenv("MINIO_ENDPOINT")
	access_key := os.Getenv("MINIO_KEY")
	access_secret := os.Getenv("MINIO_SECRET")

	if endpoint == "" || access_key == "" || access_secret == "" {
		log.Fatal("missing env variables for MINIO")
	}

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(access_key, access_secret, ""),
		Secure: false,
	})

	if err != nil {
		log.Fatal(err)
	}

	minClient = client

	// temp test
	exists, err := client.BucketExists(ctx, "hub")

	if err != nil {
		log.Fatal(err)
	}

	log.Printf("bucket exists: %t", exists)
}

func InitializePostGres() {

}
