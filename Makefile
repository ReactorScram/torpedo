torpedo-server: torpedo-server.go
	go build $< && strip $@
