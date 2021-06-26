
name=my-haproxy

build-only:
	docker build -t $(name) .

test-conf:
	docker run -it --rm --name haproxy-syntax-check my-haproxy haproxy -c -f /usr/local/etc/haproxy/haproxy.cfg

# --network="host"
# -v /Users/eliseykoney/Desktop/Development/haproxy/docker/dev/log:/dev/log

create:
	docker run -d  -p 8080:80 --name haproxy\
	 		--sysctl net.ipv4.ip_unprivileged_port_start=0 my-haproxy\
	 		/bin/sh -c "/sbin/syslogd -O /dev/stdout && haproxy -f /usr/local/etc/haproxy/haproxy.cfg"

create-rsyslog:
	docker run --name rsyslog -p 514:514 rsyslog/syslog_appliance_alpine

up:
	docker-compose -p proxy up -d --build