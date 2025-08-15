package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/google/uuid"
)

// 10 min without updates
const DEFAULT_UPLOAD_EXPIRATION = 10 * 60
const TEMP_UPLOAD_LOCATION = "./.temp/upload/"

// @TODO: consider using bytes instead of string for id
// @TODO: sanitize file_name so i dont have bullshit like: ../shit.mp4 fucking everything up
type UploadSession struct {
	ID        string `json:"id"`
	FileName  string `json:"file_name"`
	TotalSize int64  `json:"total_size"`
	Size      int64  `json:"size"`
	Status    string `json:"status"`
}

// from user request
type UploadRequest struct {
	FileName string `json:"file_name"`
	Size     int64  `json:"size"`
}

func WriteFile(location string, data []byte) bool {
	f, err := os.OpenFile(location, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0644)

	if err != nil {
		log.Print(err)
		return false
	}

	defer f.Close()

	_, err = f.Write(data)

	if err != nil {
		log.Print(err)
		return false
	}

	return true
}

func CreateNewUpload(filename string, size int64) (*UploadSession, error) {
	upload := &UploadSession{
		ID:        uuid.NewString(),
		FileName:  filename,
		TotalSize: size,
		Size:      0,
		Status:    "waiting",
	}

	// @TODO: serializing and deserializing each time we need to update doenst seems to be a good idea...
	data, _ := json.Marshal(upload)
	UploadCache.Set([]byte(upload.ID), data, DEFAULT_UPLOAD_EXPIRATION)

	return upload, nil
}

func UpdateUpload(id string, data []byte) (*UploadSession, error) {
	cached, err := UploadCache.Get([]byte(id))

	if err != nil {
		return nil, err
	}

	upload := &UploadSession{}
	des_err := json.Unmarshal(cached, &upload)

	if des_err != nil {
		return nil, err
	}

	new_size := int64(len(data)) + upload.TotalSize

	// check if we're out of bounds
	if new_size > upload.TotalSize {
		return nil, errors.New("out of bounds")
	}

	// append buffer to temp file
	location := fmt.Sprintf("%s/%s", TEMP_UPLOAD_LOCATION, upload.FileName)
	WriteFile(location, data)

	// update cache
	upload.Size = new_size
	new_data, _ := json.Marshal(upload)
	UploadCache.Set([]byte(id), new_data, DEFAULT_UPLOAD_EXPIRATION)

	return upload, nil
}

func FinishUpload(id string) bool {
	return UploadCache.Del([]byte(id))
}
