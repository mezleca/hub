package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/mezleca/hub/backend/internal/api/services"
)

func HandleNewUpload(w http.ResponseWriter, r *http.Request) {
	upload_req := services.UploadRequest{}

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

}

func HandleFinishUpload(w http.ResponseWriter, r *http.Request) {

}
