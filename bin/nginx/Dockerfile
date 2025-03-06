FROM nginx:stable-alpine

ADD bin/nginx/*.conf /etc/nginx/
ADD bin/nginx/templates /etc/nginx/templates

RUN rm -f /etc/nginx/conf.d/*
