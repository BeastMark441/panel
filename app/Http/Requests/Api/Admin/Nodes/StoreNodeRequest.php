<?php

declare(strict_types=1);

namespace Pterodactyl\Http\Requests\Api\Admin\Nodes;

use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Validator;
use Pterodactyl\Actions\Nodes\CreateNode;
use Pterodactyl\Enum\Permissions;
use Pterodactyl\Http\Requests\Api\Admin\AdminApiRequest;
use Pterodactyl\Http\Requests\Concerns\ValidatesExtensionFields;
use Pterodactyl\Models\Node;
use Pterodactyl\Rules\Fqdn;

class StoreNodeRequest extends AdminApiRequest
{
    use ValidatesExtensionFields;

    public function permissions(): array
    {
        return [Permissions::AdminNodesCreate];
    }

    /**
     * Validation rules for creating a node: the node's own, with an FQDN that resolves and is
     * not an IP address when the node uses HTTPS.
     *
     * @return ValidationRules
     */
    public function rules(): array
    {
        $rules = CreateNode::rules();
        $rules['fqdn'][] = Fqdn::make('scheme');

        return $rules;
    }

    /**
     * @return list<Closure(Validator): void>
     */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($this->isSecure() && $this->input('scheme') === 'http') {
                $validator->errors()->add(
                    'scheme',
                    'HTTP node connections cannot be used when the Panel is loaded over HTTPS.'
                );
            }
        }];
    }

    /** Rename fields to be more clear in error messages. */
    public function attributes(): array
    {
        return [
            'daemon_base' => 'Базовый путь демона',
            'upload_size' => 'Лимит размера загрузки файлов',
            'location_id' => 'Локация',
            'public' => 'Видимость ноды',
        ];
    }

    /**
     * {@inheritdoc}
     */
    protected function extensionFieldsModel(): Model|string
    {
        return Node::class;
    }
}
