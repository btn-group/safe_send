# Safe Send

## What is the project’s purpose? What problem does it solve?

Safe Send is a decentralised payment gateway that makes it easy and safe for businesses to accept crypto on Aleph Zero. By utilising a chequeing mechanism, send/collect, it makes crypto payments forgiving enough for mass adoption.

Safe Send also integrates AZERO.ID, to provide an optional, extra layer of protection. It does this by verifying that the recipient's wallet matches the provided AZERO.ID.

Safe Send is designed to fit into modern e-commerce workflows.

Try it out [here](https://safe-send-1b21f69f1e42.herokuapp.com/).

## Key ideas and an overview of the architecture;

1. Ruby on Rails
2. Ink!: Safe Send smart contract
3. Subsquid.io: Indexing Safe Send smart contract
4. smartcontracthub.tech: Storing and accessing smart contract metadata.

## If possible, any diagrams and screenshots help a lot in understanding the project;

Please see project page on [Taikai](https://taikai.network/alephzero/hackathons/CTRL-Hack-ZK/projects/clr8acwmt00hpvn013su7148q/idea)

## If any smart contracts are deployed, their addresses on the Aleph Zero Testnet;

[5EZJQm6g64rhajevm6k4NZmPgyiy95FUAk8Hdz1yaHWo83np](https://smartcontracthub.tech/?search=44&search_by=id)

### Development

```
bin/dev
```

## Checking code
```
rubocop -A
haml-lint app/views/
yarn prettier --write app/javascript/
scss-lint
```

## References

1. https://github.com/btn-group/safe_send
2. https://github.com/btn-group/az_safe_send
3. https://github.com/btn-group/squid_safe_send
4. https://smartcontracthub.tech
5. https://ctrl-hack-zk.notion.site/Submissions-bb00bcedbda04c34859a08b6ab7e6c59