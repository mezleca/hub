package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/mezleca/hub/backend/internal/api/routes"
)

func Initialize() {
	// create new router
	r := chi.NewRouter()

	// to print information about the start / end of a request
	r.Use(middleware.Logger)

	// setup handlers
	r.Get("/", routes.HandleTest)

	http.ListenAndServe(":8082", r)
}
