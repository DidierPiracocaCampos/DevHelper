import { Route, UrlSegment } from "@angular/router";
import { Authenticator } from "../shared/service/authenticator";
import { inject } from "@angular/core";

export function authCanMatch(not: boolean = false) {
    return async (route: Route, segments: UrlSegment[]) => {
        const authenticator = inject(Authenticator);
        const user = await authenticator.userPromise();
        const isLogged = !!user;
        return not ? !isLogged : isLogged;
    };
}