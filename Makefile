build:
	docker-compose build

release:
	docker image tag faketools_fake-smtp bornholm/fake-smtp
	docker image tag faketools_fake-ldap bornholm/fake-ldap
	docker image tag faketools_fake-cas bornholm/fake-cas
	docker login
	docker push bornholm/fake-smtp
	docker push bornholm/fake-ldap
	docker push bornholm/fake-cas

clean:
	docker-compose down -v

.PHONY: build
