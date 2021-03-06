/* eslint-env node, mocha */

const Helper = require('hubot-test-helper');

const helper = new Helper('../index.js');
const assert = require('assert');

function equal (actual, expected) {
	try {
		assert.equal(actual, expected);
		return Promise.resolve();
	} catch (err) {
		return Promise.reject(err);
	}
}

function msgEqual (actual, expected) {
	return equal(actual[0], expected[0])
			.then(() => equal(actual[1], expected[1]));
}

function lastMessage (room) {
	return room.messages[room.messages.length - 1];
}

describe('hubot-respond', function () {
	let room;

	describe('Add new responds', function () {

		before(function () {
			room = helper.createRoom();
		});

		after(function () {
			room.destroy();
		});

		it('should add respond', function () {
			return room.user.say('alice', '@hubot respond to foo with bar')
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', '@alice Respond added'];

					return msgEqual(actual, expected);
				});
		});

		it('should add another response', function () {
			return room.user.say('bob', '@hubot respond to lorem with ipsum')
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', '@bob Respond added'];

					return msgEqual(actual, expected);
				});
		});

		it('should not add respond with | char', function () {
			return room.user.say('bob', '@hubot respond to abc|def with ipsum')
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['bob', '@hubot respond to abc|def with ipsum'];

					return msgEqual(actual, expected);
				});
		});
	});

	describe('Responds to matching message', function () {
		before(function () {
			room = helper.createRoom();
			return room.user.say('alice', '@hubot respond to foo with bar');
		});

		after(function () {
			room.destroy();
		});

		it('should respond if the message is just the matching text', () => {
			return room.user.say('alice', '@hubot respond to foo with bar')
				.then(room.user.say('john', 'foo'))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', 'bar'];

					return msgEqual(actual, expected);
				});
		});

		it('should respond if the message is part of a longer message', () => {
			return room.user.say('john', 'This is a message, where the foo text is embedded somewhere')
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', 'bar'];

					return msgEqual(actual, expected);
				});
		});

		it('should not respond if the text is not a word in the message', () => {
			let len = room.messages.length;

			return room.user.say('john', 'This is a message, where the fooish text is embedded somewhere')
				.then(() => equal(room.messages.length, len + 1));
		});

		it('should respond if letter cases don\'t match',  () => {
			return room.user.say('alice', '@hubot respond to lOrEm with ipsum')
				.then(() => room.user.say('john', 'LoReM'))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', 'ipsum'];

					return msgEqual(actual, expected);
				});
		});

		it('should respond to unicode characters', () => {
			return room.user.say('alice', '@hubot respond to ❇ with flower')
				.then(() => room.user.say('john', '❇'))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', 'flower'];

					return msgEqual(actual, expected);
				});
		});

		it('should respond to unicode characters', () => {
			return room.user.say('alice', '@hubot respond to ❇ with flower')
				.then(() => room.user.say('john', '-❇"'))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', 'flower'];

					return msgEqual(actual, expected);
				});
		});
	});

	describe('Delete respond', function () {
		before(function () {
			room = helper.createRoom();
			return room.user.say('alice', '@hubot respond to foo with bar');
		});

		after(function () {
			room.destroy();
		});

		it('should say that respond deleted', () => {
			return room.user.say('alice', '@hubot delete respond to foo')
				.then(() =>equal(room.messages.length, 4))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', '@alice respond to foo deleted'];

					return msgEqual(actual, expected);
				});
		});

		it('should not respond to text anymore', () => {
			let len = room.messages.length;
			return room.user.say('alice', 'foo').then(() => equal(room.messages.length, len + 1));
		});
	});

	describe('Update respond', function () {
		before(function () {
			room = helper.createRoom();
			return room.user.say('alice', '@hubot respond to foo with bar');
		});

		after(function () {
			room.destroy();
		});

		it('should say that the respond updated', () => {
			return room.user.say('alice', '@hubot respond to foo with baz')
				.then(() => equal(room.messages.length, 4))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', '@alice Respond updated'];

					return msgEqual(actual, expected);
				});
		});

		it('should answer with the new respond to the text', () => {
			return room.user.say('alice', 'foo')
				.then(() => equal(room.messages.length, 6))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', 'baz'];

					return msgEqual(actual, expected);
				});
		});
	});

	describe('List responds', function () {
		before(function () {
			room = helper.createRoom();
			return room.user.say('alice', '@hubot respond to foo with bar')
				.then(() => room.user.say('bob', '@hubot respond to lorem with ipsum'));
		});

		after(function () {
			room.destroy();
		});

		it('should list all responds', () => {
			return room.user.say('bob', '@hubot list responds')
				.then(() => equal(room.messages.length, 6))
				.then(() => {
					let actual = lastMessage(room);
					let expected = ['hubot', '@bob respond to foo with bar\nrespond to lorem with ipsum'];

					return msgEqual(actual, expected);
				});
		});
	});
});
