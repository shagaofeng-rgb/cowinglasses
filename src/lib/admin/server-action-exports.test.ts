import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

test("Server Action modules export only async runtime values", () => {
  const app = path.join(process.cwd(), "src", "app");
  for (const entry of readdirSync(app, { recursive: true, encoding: "utf8" })) {
    if (!/\.tsx?$/.test(entry)) continue;
    const file = ts.createSourceFile(entry, readFileSync(path.join(app, entry), "utf8"), ts.ScriptTarget.Latest);
    const first = file.statements[0];
    if (!first || !ts.isExpressionStatement(first) || !ts.isStringLiteral(first.expression) || first.expression.text !== "use server") continue;

    const hasAsync = (node: ts.Node) => ts.canHaveModifiers(node) &&
      ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword);
    for (const statement of file.statements) {
      if (!ts.canHaveModifiers(statement) ||
          !ts.getModifiers(statement)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ||
          ts.isTypeAliasDeclaration(statement) || ts.isInterfaceDeclaration(statement)) continue;

      const asyncFunction = ts.isFunctionDeclaration(statement) && hasAsync(statement);
      const asyncVariables = ts.isVariableStatement(statement) && statement.declarationList.declarations.every(({ initializer }) =>
        initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)) && hasAsync(initializer));
      assert.ok(asyncFunction || asyncVariables, `${entry} must keep non-action values in a separate module`);
    }
  }
});
