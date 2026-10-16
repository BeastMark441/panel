<?php

declare(strict_types=1);

namespace Pterodactyl\Exceptions\Service\User;

use Pterodactyl\Exceptions\DisplayException;

class TwoFactorAuthenticationTokenInvalid extends DisplayException
{
    /**
     * TwoFactorAuthenticationTokenInvalid constructor.
     */
    public function __construct()
    {
        parent::__construct(trans('exceptions.two_factor.invalid_token'));
    }
}
