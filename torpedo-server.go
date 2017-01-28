package main

import (
	"fmt"
	"github.com/jcuga/golongpoll"
	//"io/ioutil"
	"log"
	"net/http"
	"time"
)

func addDefaultHeaders(fn http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "http://localhost:8080")
        fn(w, r)
    }
}

func main () {
	manager, err := golongpoll.StartLongpoll (golongpoll.Options {
		LoggingEnabled: true,
	})
	if err != nil {
		log.Fatalf ("Failed to create manager: %q", err)
	}
	
	//go generateTimes (manager)
	
	http.HandleFunc ("/torpedo/events", addDefaultHeaders (manager.SubscriptionHandler))
	
	http.HandleFunc ("/torpedo/ready", addDefaultHeaders (playerIsReady (manager, true)))
	
	http.HandleFunc ("/torpedo/unready", addDefaultHeaders (playerIsReady (manager, false)))
	
	host := "127.0.0.1:8081"
	fmt.Println ("Listening... ", host);
	http.ListenAndServe (host, nil)
	
	manager.Shutdown ()
}

func playerIsReady (lpManager * golongpoll.LongpollManager, ready bool) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
		if ready {
			lpManager.Publish ("torpedo", "play")
		} else {
			lpManager.Publish ("torpedo", "pause")
		}
        fmt.Fprintf (w, ":)")
    }
}

func generateTimes (lpManager *golongpoll.LongpollManager) {
	for {
		time.Sleep (time.Duration (10000) * time.Millisecond)
		lpManager.Publish ("torpedo", "Longer than you think!")
	}
}
