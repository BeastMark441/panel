<?php

declare(strict_types=1);

return [
    'daemon_connection_failed' => 'There was an exception while attempting to communicate with the daemon resulting in a HTTP/:code response code. This exception has been logged.',
    'node' => [
        'servers_attached' => 'A node must have no servers linked to it in order to be deleted.',
        'daemon_off_config_updated' => 'The daemon configuration has been updated, however there was an error encountered while attempting to automatically update the configuration file on the Daemon. You will need to manually update the configuration file (config.yml) for the daemon to apply these changes.',
    ],
    'allocations' => [
        'server_using' => 'A server is currently assigned to this allocation. An allocation can only be deleted if no server is currently assigned.',
        'too_many_ports' => 'Adding more than 1000 ports in a single range at once is not supported.',
        'invalid_mapping' => 'The mapping provided for :port was invalid and could not be processed.',
        'cidr_out_of_range' => 'CIDR notation only allows masks between /25 and /32.',
        'port_out_of_range' => 'Ports in an allocation must be greater than 1024 and less than or equal to 65535.',
    ],
    'egg' => [
        'delete_has_servers' => 'An Egg with active servers attached to it cannot be deleted from the Panel.',
        'invalid_copy_id' => 'The Egg selected for copying a script from either does not exist, or is copying a script itself.',
        'has_children' => 'This Egg is a parent to one or more other Eggs. Please delete those Eggs before deleting this Egg.',
        'variables' => [
            'reserved_name' => 'The environment variable :name is protected and cannot be assigned to a variable.',
            'bad_validation_rule' => 'The validation rule ":rule" is not a valid rule for this application.',
        ],
        'importer' => [
            'json_error' => 'There was an error while attempting to parse the JSON file: :error.',
            'file_error' => 'The JSON file provided was not valid.',
            'invalid_json_provided' => 'The JSON file provided is not in a format that can be recognized.',
            'invalid_definition' => 'The selected catalog egg contains an invalid definition.',
            'not_in_catalog' => 'The selected egg is no longer in the Pterodactyl catalog. Refresh the catalog and try again.',
        ],
    ],
    'subusers' => [
        'editing_self' => 'Editing your own subuser account is not permitted.',
        'user_is_owner' => 'You cannot add the server owner as a subuser for this server.',
        'subuser_exists' => 'A user with that email address is already assigned as a subuser for this server.',
    ],
    'databases' => [
        'delete_has_databases' => 'Cannot delete a database host server that has active databases linked to it.',
        'no_suitable_host' => 'No database host was found that meets the requirements for this server.',
        'too_many' => 'Operation aborted: creating a new database would put this server over the defined limit.',
        'client_creation_disabled' => 'Client database creation is not enabled in this Panel.',
        'duplicate_name' => 'A database with that name already exists for this server.',
    ],

    'backups' => [
        'locked' => 'Cannot delete a backup that is marked as locked.',
    ],

    'file' => [
        'too_large_to_view' => 'The file you are attempting to open is too large to view in the file editor.',
    ],

    'two_factor' => [
        'invalid_token' => 'The provided two-factor authentication token was not valid.',
    ],

    'schedules' => [
        'invalid_cron' => 'The cron data provided does not evaluate to a valid expression.',
    ],
    'tasks' => [
        'chain_interval_too_long' => 'The maximum interval time for a chained task is 15 minutes.',
    ],
    'locations' => [
        'has_nodes' => 'Cannot delete a location that has active nodes attached to it.',
    ],
    'users' => [
        'node_revocation_failed' => 'Failed to revoke keys on <a href=":link">Node #:node</a>. :error',
    ],
    'deployment' => [
        'no_viable_nodes' => 'No nodes satisfying the requirements specified for automatic deployment could be found.',
        'no_viable_allocations' => 'No allocations satisfying the requirements for automatic deployment were found.',
    ],
    'api' => [
        'resource_not_found' => 'The requested resource does not exist on this server.',
    ],
];
