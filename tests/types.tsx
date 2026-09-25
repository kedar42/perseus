import { NavMenu } from "../src";

// @ts-expect-error render-function children require textValue for the collapsed tooltip
export const withoutTextValue = <NavMenu.Item href="/">{() => "Docs"}</NavMenu.Item>;
export const withTextValue = <NavMenu.Item href="/" textValue="Docs">{({ isHovered }) => String(isHovered)}</NavMenu.Item>;
