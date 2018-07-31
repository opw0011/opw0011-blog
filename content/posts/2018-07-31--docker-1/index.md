---
title: "[Docker-101] Tutorial 1"
subTitle: Deploy static website as container
cover: docker.png
category: "docker"
---

![nginx-docker](./nginx-docker.jpg)

Task:  To create a container to host HTML with Alpine version of Nginx.

Suppose we got a html file named `index.html`.

1. Create a `Dockerfile` 
```
FROM nginx:alpine
COPY . /usr/share/nginx/html
```
```
ls
Dockerfile  index.html
```
2. Build a docker images 
```
$ docker build -t webserver:v1 .
Sending build context to Docker daemon  3.072kB
Step 1/2 : FROM nginx:alpine
---> 36f3464a2197
Step 2/2 : COPY . /user/share/nginx/html
---> 028eb21675d7
Successfully built 028eb21675d7
Successfully tagged webserver:latest
```
```
docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
webserver           v1                  028eb21675d7        6 minutes ago       18.6MB
```

3. Run the docker container
  ```
  docker run -d -p 80:80 webserver:v1
  ```
  When a container launches, it's sandboxed from other processes and networks on the host. Therefore, we need to open and bind to a network port on the host by using `-p <host-port>:<container-port>`
