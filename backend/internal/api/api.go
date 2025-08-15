package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/mezleca/hub/backend/internal/api/handlers"
)

func Initialize() {
	// create new router
	r := chi.NewRouter()

	// to print information about the start / end of a request
	r.Use(middleware.Logger)

	// setup cors config
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://127.0.0.1:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	// index
	r.Get("/", handlers.HandleTest)

	// upload routes
	r.Post("/upload/new", handlers.HandleNewUpload)
	r.Post("/upload/update", handlers.HandleUpdateUpload)
	r.Post("/upload/finish", handlers.HandleFinishUpload)

	http.ListenAndServe(":8082", r)
}
