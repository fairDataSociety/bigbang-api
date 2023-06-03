exports.up = function(knex) {
  return knex.schema
  .createTable('inviter', function (table) {
    table.bigIncrements('id').primary();
    table.string('address', 42).unique();
    table.dateTime('created_at').defaultTo(knex.fn.now());
    table.dateTime('updated_at').defaultTo(knex.fn.now());
  })
  .createTable('invite', function (table) {
    table.bigIncrements('id').primary();
    table.bigInteger('inviter_id').unsigned().index();
    table.string('invite_address', 42).index();
    table.string('inviter_signature', 132);
    table.string('invite_signature', 132);
    table.dateTime('created_at').defaultTo(knex.fn.now());
    table.dateTime('updated_at').defaultTo(knex.fn.now());

    table.unique(['inviter_id', 'invite_address']);
    table.foreign('inviter_id').references('id').inTable('inviter');
  });
};

exports.down = function(knex) {
  return knex.schema
  .dropTable('invite')
  .dropTable('inviter');
};
