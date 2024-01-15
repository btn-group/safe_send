# Safe Send

Safe Send is a decentralised payment gateway that makes it easy and safe for businesses to accept crypto on Aleph Zero. By utilising a chequeing mechanism, send/collect, it makes crypto payments forgiving enough for mass adoption.

Safe Send also integrates AZERO.ID, to provide an optional, extra layer of protection. It does this by verifying that the recipient's wallet matches the provided AZERO.ID.

Safe Send is designed to fit into modern e-commerce workflows.

Try it out [here](https://safe-send-1b21f69f1e42.herokuapp.com/).

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
