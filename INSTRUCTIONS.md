TatoeBattle

Heroku:
- Add buildpacks
    - Node
    - Python
- Add add-ons:
    - Redis
    - Postgres
    - New Relic APM
        - Configure Synthetic Monitor
- Add "ECOSYSTEM=HEROKU" config var
- Run commands in Heroku CLI:
    $ heroku config:set -a tatoebattle GOOGLE_CREDENTIALS_JSON="$(< $JSON_PATH)"

Docker Compose:
- Run command "sudo docker-compose up" at project root

A special thanks to:
 - Tatoeba
 - Fortnite
 - Pokémon Showdown! 
