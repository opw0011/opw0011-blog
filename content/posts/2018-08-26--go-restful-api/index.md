---
title: "Go Web Tutorial 1"
subTitle: Build a simple RESTful API service with Go
cover: golang.png
category: "go"
---

![sentry-banner](./go-banner.png)

In this tutorial, we will go through how to build a simple RESTful APIs with Golang. The service will handle CRUD operatioins and response with simple json text.


## Getting started
This is just to make sure the go environment setup is ready.

`main.go`
```go
package main

import "fmt"

// handle all the http requests
func handleRequests() {
	// TODO: GET, POST, PUT, DELETE
}

func main() {
	fmt.Println("The server starts")
	handleRequests()
}
```
```
go run .\main.go
The server starts
```

## Make a Http handler
```go
package main

import (
	"fmt"
	"log"
	"net/http"
)

func index(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Index page")
}

// handle all the http requests
func handleRequests() {
	// TODO: GET, POST, PUT, DELETE
	http.HandleFunc("/", index)

	log.Fatal(http.ListenAndServe("localhost:3000", nil))
}

func main() {
	fmt.Println("The server starts")
	handleRequests()
}
```
we added a `http.HandlerFunc` to map path / to our `index` function, which return simple words `index page`.
```
curl localhost:3000
Index page
```

## Add a Router to handle request
First we have to import `github.com/gorilla/mux`, which is a very powerfull URL router for Golang.
```go
import (
  // skips
  "github.com/gorilla/mux"
)
```

In our `handleRequests()` function, declare a new mux router using `mux.NewRouter()`, and replace `http.HandleFunc()` to `router.HandleFunc()`. Finally, Pass our mux router handler to `http.ListenAndServe()`.
```go
func handleRequests() {
	router := mux.NewRouter()

	// TODO: GET, POST, PUT, DELETE
	router.HandleFunc("/", index).Methods("GET")

	log.Fatal(http.ListenAndServe("localhost:3000", router))
}
```

## Building GET, POST, PUT, DELETE endpoints
We make another file `todos.go`:
```go
package main

import (
	"fmt"
	"net/http"
)

func ListTodos(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "list todos")
}

func AddTodo(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "add todo")
}

func UpdateTodo(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "update todo")
}

func DeleteTodo(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "delete todo")
}

```

Then, update our `handleRequests()` function to map the GET, POST, DELTE, PUT todos endpoints
```go
func handleRequests() {
	router := mux.NewRouter()

	router.HandleFunc("/", index).Methods("GET")

	// GET, POST, PUT, DELETE
	router.HandleFunc("/todos", ListTodos).Methods("GET")
	router.HandleFunc("/todos", AddTodo).Methods("POST")
	router.HandleFunc("/todos", UpdateTodo).Methods("PUT")
	router.HandleFunc("/todos", DeleteTodo).Methods("DELETE")

	log.Fatal(http.ListenAndServe("localhost:3000", router))
}
```
Then run with `go run .\main.go .\todos.go`

Results:
```sh
curl localhost:3000/todos
list

curl localhost:3000/todos -X 'POST'
add todo

curl localhost:3000/todos -X 'PUT'
update

curl localhost:3000/todos -X 'DELETE'
delete
```

## Build a ToDo model

in `todos.go`, add a `Todo` class, and declare variralbes to store data in memory

```go
type Todo struct {
	ID      uint   `json:"id"`
	Title   string `json:"title"`
	Content string `json:"content"`
}

// in memory variables to act as db
var uuid uint = 1
var toDoStore []Todo = []Todo{}
```

Then, update our todo handler to return todo json.
```go
import (
// skips others
	"encoding/json"
)
```
```go
func ListTodos(w http.ResponseWriter, r *http.Request) {
	// fmt.Fprint(w, "list todos")
	json.NewEncoder(w).Encode(toDoStore)
}

func AddTodo(w http.ResponseWriter, r *http.Request) {
	// fmt.Fprint(w, "add todo")
	newTodo := Todo{ID: uuid, Title: "test", Content: "content"}
	toDoStore = append(toDoStore, newTodo)
	uuid++
	json.NewEncoder(w).Encode(newTodo)
}
```

```sh
curl localhost:3000/todos -X 'POST'
{"id":1,"title":"test","content":"content"}

curl localhost:3000/todos -X 'POST'
{"id":2,"title":"test","content":"content"}

curl localhost:3000/todos -X 'GET'
[{"id":1,"title":"test","content":"content"},{"id":2,"title":"test","content":"content"}]
```

## Complete the CRUD operation

Update the `handleRequests` router
```go
// GET, POST, PUT, DELETE
router.HandleFunc("/todos", ListTodos).Methods("GET")
router.HandleFunc("/todos", AddTodo).Methods("POST")
router.HandleFunc("/todos/{id:[0-9]+}", UpdateTodo).Methods("PUT")
router.HandleFunc("/todos/{id:[0-9]+}", DeleteTodo).Methods("DELETE")
```

In `todos.go`, add a helper function to parse the request json to `Todo` object
```go
func decodeJSONRequest(r *http.Request) Todo {
	decoder := json.NewDecoder(r.Body)
	var rTodo Todo
	err := decoder.Decode(&rTodo)
	if err != nil {
		panic(err)
	}
	return rTodo
}
```

And update the CRUD operations:

```go
func ListTodos(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(toDoStore)
}

func AddTodo(w http.ResponseWriter, r *http.Request) {
	rTodo := decodeJSONRequest(r)

	newTodo := Todo{ID: uuid, Title: rTodo.Title, Content: rTodo.Content}
	toDoStore = append(toDoStore, newTodo)
	uuid++
	json.NewEncoder(w).Encode(newTodo)
}

func UpdateTodo(w http.ResponseWriter, r *http.Request) {
	// Get id from url
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		panic(err)
	}

	rTodo := decodeJSONRequest(r)

	var updatedIndex int
	for i, todo := range toDoStore {
		if todo.ID == uint(id) {
			newTodo := Todo{ID: todo.ID, Title: rTodo.Title, Content: rTodo.Content}
			toDoStore = append(toDoStore[:i], toDoStore[i+1:]...)
			toDoStore = append(toDoStore, newTodo)
			updatedIndex = i
			break
		}
	}

	json.NewEncoder(w).Encode(toDoStore[updatedIndex])
}

func DeleteTodo(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		panic(err)
	}
  
	var deletedTodo Todo
	for i, todo := range toDoStore {
		if todo.ID == uint(id) {
			toDoStore = append(toDoStore[:i], toDoStore[i+1:]...)
			deletedTodo = todo
			break
		}
	}
  
	json.NewEncoder(w).Encode(deletedTodo)
}
```
## Results
```sh
go run main.go todos.go

curl http://localhost:3000/todos -X 'GET'
[]

# insert 3 dummy todos

curl http://localhost:3000/todos -X 'POST' -d '{"title": "test title1", "content": "c1"}'
{"id":1,"title":"test title1","content":"c1"}

curl http://localhost:3000/todos -X 'POST' -d '{"title": "test title2", "content": "c2"}'
{"id":2,"title":"test title2","content":"c2"}

curl http://localhost:3000/todos -X 'POST' -d '{"title": "test title3", "content": "c3"}'
{"id":3,"title":"test title3","content":"c3"}

curl http://localhost:3000/todos -X 'GET'
[{"id":1,"title":"test title1","content":"c1"},{"id":2,"title":"test title2","content":"c2"},{"id":3,"title":"test title3","content":"c3"}]

# Update Todo id = 3
curl http://localhost:3000/todos/3 -X 'PUT' -d '{"title": "updated3", "content": "update3"}'
{"id":3,"title":"updated3","content":"update3"}

curl http://localhost:3000/todos -X 'GET'
[{"id":1,"title":"test title1","content":"c1"},{"id":2,"title":"test title2","content":"c2"},{"id":3,"title":"updated3","content":"update3"}]

# Delete Todo id=2
curl http://localhost:3000/todos/2 -X 'DELETE'
{"id":2,"title":"test title2","content":"c2"}

curl http://localhost:3000/todos -X 'GET'
[{"id":1,"title":"test title1","content":"c1"},{"id":3,"title":"updated3","content":"update3"}]
```

This tutorial is only for demo basic Go CURD operations with in-memory storage. In later tutorial, we will discuss how to persist data in database using [gorm](https://github.com/jinzhu/gorm).

## Complete codes
`main.go`
```go
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func index(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Index page")
}

// handle all the http requests
func handleRequests() {
	router := mux.NewRouter()

	router.HandleFunc("/", index).Methods("GET")

	// GET, POST, PUT, DELETE
	router.HandleFunc("/todos", ListTodos).Methods("GET")
	router.HandleFunc("/todos", AddTodo).Methods("POST")
	router.HandleFunc("/todos/{id:[0-9]+}", UpdateTodo).Methods("PUT")
	router.HandleFunc("/todos/{id:[0-9]+}", DeleteTodo).Methods("DELETE")

	log.Fatal(http.ListenAndServe("localhost:3000", router))
}

func main() {
	fmt.Println("The server starts")
	handleRequests()
}
```

`todos.go`
```go
package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type Todo struct {
	ID      uint   `json:"id"`
	Title   string `json:"title"`
	Content string `json:"content"`
}

// in memory variables to act as db
var uuid uint = 1
var toDoStore []Todo = []Todo{}

func ListTodos(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(toDoStore)
}

func AddTodo(w http.ResponseWriter, r *http.Request) {
	rTodo := decodeJSONRequest(r)

	newTodo := Todo{ID: uuid, Title: rTodo.Title, Content: rTodo.Content}
	toDoStore = append(toDoStore, newTodo)
	uuid++
	json.NewEncoder(w).Encode(newTodo)
}

func UpdateTodo(w http.ResponseWriter, r *http.Request) {
	// Get id from url
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		panic(err)
	}

	rTodo := decodeJSONRequest(r)

	var updatedIndex int
	for i, todo := range toDoStore {
		if todo.ID == uint(id) {
			newTodo := Todo{ID: todo.ID, Title: rTodo.Title, Content: rTodo.Content}
			toDoStore = append(toDoStore[:i], toDoStore[i+1:]...)
			toDoStore = append(toDoStore, newTodo)
			updatedIndex = i
			break
		}
	}

	json.NewEncoder(w).Encode(toDoStore[updatedIndex])
}

func DeleteTodo(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		panic(err)
	}

	var deletedTodo Todo
	for i, todo := range toDoStore {
		if todo.ID == uint(id) {
			toDoStore = append(toDoStore[:i], toDoStore[i+1:]...)
			deletedTodo = todo
			break
		}
	}

	json.NewEncoder(w).Encode(deletedTodo)
}

func decodeJSONRequest(r *http.Request) Todo {
	decoder := json.NewDecoder(r.Body)
	var rTodo Todo
	err := decoder.Decode(&rTodo)
	if err != nil {
		panic(err)
	}
	return rTodo
}
```
