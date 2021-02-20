# Varasto

Varasto is minimalistic namespaced key-value store that can store JSON objects
identified by namespace and key. Objects are persisted on disk.

Varasto comes with an HTTP interface, allowing you to store, retrieve and
remove items from it.

## Installation

```bash
$ npm install -g @varasto/server
```

## Usage

```bash
$ varasto [-p port] [-a username:password] <directory>
```

Port which the HTTP server will be responding from can be specified with the
`-p` flag. By default Varasto will use port `3000`.

Optional [basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication)
can be enabled with `-a` flag.

The directory where items are stored is specified with `<directory>` command
line argument. If the directory does not exist, it will be created once items
are being stored.

Once the HTTP server is up and running, you can use HTTP methods `GET`, `POST`
and `DELETE` to retrieve, store and remove items from the store.

## Items

Each item is identified by two identifiers: namespace and key. Both of these
must be [valid URL slugs](https://ihateregex.io/expr/url-slug/).

## Storing items

To store an item, you can use a `POST` request like this:

```http
POST /foo/bar HTTP/1.0
Content-Type: application/json
Content-Length: 14

{"foo": "bar"}
```

Or you can use [curl](https://curl.haxx.se) to store an item like this:

```bash
$ curl -X POST \
    -H 'Content-Type: application/json' \
    -d '{"foo": "bar"}' \
    http://localhost:3000/foo/bar
```

Namespace of the item in the example above would be `foo` and the key would be
`bar`. These identifiers can now be used to retrieve, update or remove the
stored item.

## Retrieving items

To retrieve a previously stored item, you make an `GET` request, where the
request path again acts as the identifier of the item.

```http
GET /foo/bar HTTP/1.0
```

To which the HTTP server will respond with the JSON object previously stored
with namespace `foo` and key `bar`. If an item with given key under the given
namespace does not exist, HTTP error 404 will be returned instead.

## Removing items

To remove an previously stored item, you make a `DELETE` request, with the
request path again acting as the identifier of the item you wish to remove.

```http
DELETE /foo/bar HTTP/1.0
```

If item with key `bar` under namespace `foo` exists, it's value will be
returned as response. If such item does not exist, HTTP error 404 will be
returned instead.

## Updating items

You can also partially update an already existing item with `PATCH` request.
The JSON sent with an `PATCH` request will be shallowly merged with the already
existing data and the result will be sent as response.

For example, you have an item `john-doe` under namespace `people` with the
following data:

```JSON
{
    "name": "John Doe",
    "address": "Some street 4",
    "phoneNumber": "+35840123123"
}
```

And you send an `PATCH` request like this:

```http
PATCH /people/john-doe HTTP/1.0
Content-Type: application/json
Content-Length: 71

{
    "address": "Some other street 5",
    "faxNumber": "+358000000"
}
```

You end up with:

```JSON
{
    "name": "John Doe",
    "address": "Some other street 5",
    "phoneNumber": "+35840123123",
    "faxNumber": "+358000000"
}
```

## Security notes

The HTTP server does not currently support [HTTPS](https://en.wikipedia.org/wiki/HTTPS)
and the only authentication (which is not enabled by default) is
[basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication),
so you might not want to expose it to public network.
