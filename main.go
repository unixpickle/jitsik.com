package main

import (
	"flag"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"strconv"

	"github.com/unixpickle/essentials"
)

var EmailUsername, EmailPassword string
var EmailRecipient string

func main() {
	var port int
	flag.IntVar(&port, "port", 1337, "port number")
	flag.Parse()

	EmailUsername = os.Getenv("CONTACT_EMAIL")
	EmailPassword = os.Getenv("CONTACT_PASSWORD")
	EmailRecipient = os.Getenv("CONTACT_RECIPIENT")
	if EmailUsername == "" || EmailPassword == "" || EmailRecipient == "" {
		essentials.Die("Set CONTACT_EMAIL, CONTACT_PASSWORD, and " +
			"CONTACT_RECIPIENT env vars.")
	}
	http.HandleFunc("/contact", ContactForm)
	http.Handle("/", http.FileServer(http.Dir(".")))

	if err := http.ListenAndServe(":"+strconv.Itoa(port), nil); err != nil {
		essentials.Die(err)
	}
}

func ContactForm(w http.ResponseWriter, r *http.Request) {
	auth := smtp.PlainAuth("", EmailUsername, EmailPassword, "smtp.gmail.com")
	bodyStr := "Email sent from contact form.\n\n" +
		"Subject: " + r.FormValue("subject") + "\n" +
		"Email: " + r.FormValue("email") + "\n" +
		"Name: " + r.FormValue("message") + "\n\n" +
		r.FormValue("body")
	err := smtp.SendMail(
		"smtp.gmail.com:587",
		auth,
		EmailUsername,
		[]string{EmailRecipient},
		[]byte(bodyStr),
	)
	if err != nil {
		log.Print(err)
	}
}
