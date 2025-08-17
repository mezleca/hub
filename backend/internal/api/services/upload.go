package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"os"

	"github.com/google/uuid"
)

// 10 min without updates
const DEFAULT_UPLOAD_EXPIRATION = 10 * 60
const MAX_UPLOAD_SIZE = 2 * 1024 * 1024 * 1024 // who tf uploads more than 2 gb?
const TEMP_UPLOAD_LOCATION = "./.temp/upload/"

// @TODO: consider using bytes instead of string for id
// @TODO: sanitize file_name so i dont have bullshit like: ../shit.mp4 fucking everything up
type UploadSession struct {
	ID        string `json:"id"`
	FileName  string `json:"file_name"`
	TotalSize int64  `json:"total_size"` // bytes
	Size      int64  `json:"size"`       // bytes
	Status    string `json:"status"`
}

// from user create request
type NewUploadRequest struct {
	FileName string `json:"file_name"`
	Size     int64  `json:"size"` // bytes
}

func fileExists(filePath string) bool {
	_, err := os.Stat(filePath)
	return !errors.Is(err, os.ErrNotExist)
}

func WriteFileChunk(location string, data []byte, offset int64) bool {
	f, err := os.OpenFile(location, os.O_CREATE|os.O_WRONLY, 0644)

	if err != nil {
		log.Print(err)
		return false
	}

	defer f.Close()

	// move to the right offset
	_, err = f.Seek(offset, io.SeekStart)

	if err != nil {
		log.Print(err)
		return false
	}

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

// @TODO: use upload id to the file
func UpdateUpload(id string, data []byte) (*UploadSession, error) {
	cached, err := UploadCache.Get([]byte(id))

	if err != nil {
		return nil, errors.New("invalid upload id (prob expired)")
	}

	upload := &UploadSession{}
	des_err := json.Unmarshal(cached, &upload)

	if des_err != nil {
		return nil, err
	}

	new_size := int64(len(data)) + upload.Size

	// check if we're out of bounds
	if new_size > upload.TotalSize {
		log.Printf("initial: %d | current: %d | new: %d | non casted: %d", upload.Size, upload.TotalSize, new_size, len(data))
		return nil, errors.New("out of bounds")
	}

	// append buffer to temp file
	temp_file_name := fmt.Sprintf("%s-%s", id, upload.FileName)
	location := fmt.Sprintf("%s/%s", TEMP_UPLOAD_LOCATION, temp_file_name)

	if !WriteFileChunk(location, data, upload.Size) {
		return nil, errors.New("failed to update upload")
	}

	// update status to finished to the frontend knows that theres no reason to upload anything
	if new_size == upload.TotalSize {
		upload.Status = "finished"
	}

	upload.Size = new_size

	// serialize new data and update cache
	new_data, _ := json.Marshal(upload)
	UploadCache.Set([]byte(id), new_data, DEFAULT_UPLOAD_EXPIRATION)

	return upload, nil
}

// @TODO: return why we have err to frontend
func FinishUpload(id string) bool {
	cached, err := UploadCache.Get([]byte(id))

	if err != nil {
		fmt.Println("a", err)
		return false
	}

	upload := UploadSession{}

	if err := json.Unmarshal(cached, &upload); err != nil {
		fmt.Println("b", err)
		return false
	}

	// remove old temp file
	temp_file_name := fmt.Sprintf("%s-%s", id, upload.FileName)
	location := fmt.Sprintf("%s/%s", TEMP_UPLOAD_LOCATION, temp_file_name)

	// remove the old file
	if fileExists(location) {
		err := os.Remove(location)
		if err != nil {
			fmt.Println("c", err)
			return false
		}
	}

	return UploadCache.Del([]byte(id))
}
