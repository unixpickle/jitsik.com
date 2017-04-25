package main

import (
	"flag"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/unixpickle/essentials"
	"github.com/unixpickle/fbmsgr"
)

var FacebookEmail, FacebookPassword string
var FacebookRecipient string

func main() {
	var port int
	flag.IntVar(&port, "port", 1337, "port number")
	flag.Parse()

	FacebookEmail = os.Getenv("CONTACT_EMAIL")
	FacebookPassword = os.Getenv("CONTACT_PASSWORD")
	FacebookRecipient = os.Getenv("CONTACT_RECIPIENT")
	if FacebookEmail == "" || FacebookPassword == "" ||
		FacebookRecipient == "" {
		essentials.Die("Set CONTACT_EMAIL, CONTACT_PASSWORD, CONTACT_RECIPIENT " +
			"env vars")
	}
	http.HandleFunc("/contact", ContactForm)
	http.Handle("/", http.FileServer(http.Dir(".")))

	if err := http.ListenAndServe(":"+strconv.Itoa(port), nil); err != nil {
		essentials.Die(err)
	}
}

func ContactForm(w http.ResponseWriter, r *http.Request) {
	client, err := fbmsgr.Auth(FacebookEmail, FacebookPassword)
	if err != nil {
		log.Println("Login error:", err)
		return
	}
	defer client.Close()
	bodyStr := "Message sent from contact form.\n\n" +
		"Subject: " + r.FormValue("subject") + "\n" +
		"Email: " + r.FormValue("email") + "\n" +
		"Name: " + r.FormValue("message") + "\n\n" +
		r.FormValue("body")
	if _, err := client.SendText(FacebookRecipient, bodyStr); err != nil {
		log.Println("Send error:", err)
	}
}
