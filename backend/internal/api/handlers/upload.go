package handlers

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/mezleca/hub/backend/internal/api/services"
)

// @TODO: assigns the new upload to a user so if he leaves the page and returns, we can continue the upload
func HandleNewUpload(w http.ResponseWriter, r *http.Request) {
	upload_req := services.NewUploadRequest{}

	if err := json.NewDecoder(r.Body).Decode(&upload_req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if upload_req.FileName == "" {
		http.Error(w, "invalid file_name", http.StatusBadRequest)
		return
	}

	if upload_req.Size == 0 || upload_req.Size > services.MAX_UPLOAD_SIZE {
		http.Error(w, "invalid file size", http.StatusBadRequest)
		return
	}

	upload, err := services.CreateNewUpload(upload_req.FileName, upload_req.Size)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(upload)
}

func HandleUpdateUpload(w http.ResponseWriter, r *http.Request) {
	upload_id := r.Header.Get("X-ID")

	if upload_id == "" {
		http.Error(w, "missing upload id", http.StatusBadRequest)
		return
	}

	upload_data, err := io.ReadAll(r.Body)

	if err != nil {
		http.Error(w, "failed to read data buffer", http.StatusBadRequest)
		return
	}

	upload, err := services.UpdateUpload(upload_id, upload_data)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(upload)
}

func HandleFinishUpload(w http.ResponseWriter, r *http.Request) {
	upload_id := r.Header.Get("X-ID")

	if upload_id == "" {
		http.Error(w, "missing upload id", http.StatusBadRequest)
		return
	}

	removed := services.FinishUpload(upload_id)

	if !removed {
		http.Error(w, "failed to finish upload (not found?)", http.StatusBadRequest)
		return
	}
}
