TatoeBattle

Heroku:
- Add Node and Python buildpacks
- Add Redis add-on
- Add "ECOSYSTEM=HEROKU" config var
- Run commands in Heroku CLI:
    $ heroku config:set -a tatoebattle GOOGLE_CREDENTIALS_JSON="$(< $PATH)"

Docker Compose:
- Run command "sudo docker-compose up" at project root