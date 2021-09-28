FROM node:12.16.3

USER root
MAINTAINER cpdmng-dev

# set working directory
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app
RUN chmod -R 777 /usr/src/app/

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

RUN ls -lrt

# install and cache app dependencies
COPY package.json /usr/src/app/
COPY .npmrc /usr/src/app/
RUN npm install
#RUN npm install -g @angular/cli
RUN ng version
RUN ls -lrt

RUN pwd

# add app
COPY . /usr/src/app
RUN ls -lrt

RUN ng build --prod

RUN ls -lrt 

#COPY ./dist /usr/src/app/dist

#RUN ls -lrt /usr/src/app/dist


#PORT
EXPOSE 4200

# start app test
#CMD ng serve --host 0.0.0.0 --disable-host-check
#CMD node server.js
#CMD npm run build
CMD node server.js