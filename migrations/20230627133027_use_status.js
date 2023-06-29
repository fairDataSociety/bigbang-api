exports.up = function(knex) {
  return knex.schema.table('invite', function(table){
    table.string('invite_use_signature', 132);
  });
};

exports.down = function(knex) {
  return knex.schema.table('invite', function(table){
    table.dropColumn('invite_use_signature');
  });
};
