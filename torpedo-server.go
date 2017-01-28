package main

import (
	"fmt"
	"github.com/jcuga/golongpoll"
	"io/ioutil"
	"log"
	"net/http"
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
	
	http.HandleFunc ("/torpedo/events", addDefaultHeaders (manager.SubscriptionHandler))
	
	http.HandleFunc ("/torpedo/ready", addDefaultHeaders (playerIsReady (manager)))
	
	host := "127.0.0.1:8081"
	fmt.Println ("Listening... ", host);
	http.ListenAndServe (host, nil)
	
	manager.Shutdown ()
}

func playerIsReady (lpManager * golongpoll.LongpollManager) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
		body, _ := ioutil.ReadAll (r.Body)
		
		lpManager.Publish ("torpedo", body)
		
        fmt.Fprintf (w, "<3")
    }
}
