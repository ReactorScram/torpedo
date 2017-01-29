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
	
	counter_chan := make(chan int, 3)
	go GoCounterRoutine(counter_chan)
	
	http.HandleFunc ("/api/events", addDefaultHeaders (manager.SubscriptionHandler))
	
	http.HandleFunc ("/api/get_id", addDefaultHeaders (func (w http.ResponseWriter, r * http.Request) {
		id := <- counter_chan
		fmt.Fprintf (w, "%d", id)
	}))
	
	http.HandleFunc ("/api/ready", addDefaultHeaders (playerIsReady (manager)))
	
	http.HandleFunc ("/", func (w http.ResponseWriter, r * http.Request) {
		//fmt.Println (r.URL.Path)
		http.ServeFile (w, r, "./" + r.URL.Path)
	})
	
	host := "127.0.0.1:8081"
	fmt.Println ("Listening... ", host);
	http.ListenAndServe (host, nil)
	
	manager.Shutdown ()
}

// started somewhere else
func GoCounterRoutine(ch chan int) {
    counter := 0
    for {
        ch <- counter
        counter += 1
    }
}

func playerIsReady (lpManager * golongpoll.LongpollManager) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
		body, _ := ioutil.ReadAll (r.Body)
		
		lpManager.Publish ("torpedo", body)
		
        fmt.Fprintf (w, "<3")
    }
}
