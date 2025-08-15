package services

import (
	"runtime/debug"

	"github.com/coocood/freecache"
)

// 128 mbs is more than enough
const DEFAULT_CACHE_SIZE = 128 * 1024 * 1024

var (
	UploadCache *freecache.Cache
)

func CreateCache() {
	UploadCache = freecache.NewCache(DEFAULT_CACHE_SIZE)
	debug.SetGCPercent(10)
}
