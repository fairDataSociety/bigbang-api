exports.up = function(knex) {
  return knex.schema.createTable('account', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('invite_id').unsigned().index();
    table.string('account_address', 132).index();
    table.string('invite_signature', 132);
    table.string('account_signature', 132);

    table.unique(['invite_id', 'account_address']);

    table.foreign('invite_id').references('id').inTable('invite');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('account');
};