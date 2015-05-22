# FakeTools

Collection de micro outils utilisés comme remplacements temporaires dans le cadre de mes développements Web.

## Démarrer avec les sources

```
git clone https://github.com/Bornholm/faketools.git
cd faketools
npm install
```

## FakeSMTP

> Nécessite l'utilisation de NodeJS en version 0.12 minimum.

Serveur simulant le fonctionnement d'un relais SMTP avec interface web/api REST de consultation des courriels "envoyés" (les courriels ne sont jamais réellement transférés).

### Utilisation (configuration par défaut)

```
./bin/fake-smtp
```

- Un serveur SMTP sera lancé sur le **port 2525**.
- L'interface Web sera consultable sur le **port 8080.**
- N'importe quel couple identifiant/mot de passe sera accepté par le serveur SMTP.
- Les courriels sont sauvegardés dans `./data/smtp`

## FakeLDAP

Serveur simulant un annuaire LDAP, sans schéma et stockant les données dans le système de fichier local.

### Utilisation (configuration par défaut)

```
./bin/fake-ldap
```

- Un serveur LDAP sera lancé sur le **port 3389**.
- Les données sont stockées dans `./data/ldap`

## FakeCAS

Micro serveur CAS

### Utilisation (configuration par défaut)

```
./bin/fake-cas
```
- Un serveur CAS sera lancé sur le **port 8443** (HTTPS).
- Les fiches des utilisateurs autorisés à se connecter sont dans `./data/cas/users`.
- Chaque fiche utilisateur est au format JSON suivant la nomenclature `<login>.json`. Voir le fichier `./data/cas/user-example.json` pour connaitre la structure des données.

## Configuration générale

Afin de modifier le comportement des différents outils, vous pouvez créer un fichier `.faketoolsrc` à la racine du projet ou dans votre répertoire `$HOME`.

Ce fichier au format JSON vous permet de surcharger les paramètres de configuration des outils. Voir la configuration par défaut dans `./lib/config.js` pour connaître les paramètres disponibles.
