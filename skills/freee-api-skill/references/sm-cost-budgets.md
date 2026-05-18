# cost_budgets

## 概要

原価予算

## エンドポイント一覧

### GET /cost_budgets

操作: 原価予算一覧

説明: 概要 原価予算の一覧を取得します。 登録されている原価予算情報を一覧形式で取得できます。 各種フィルタ条件を指定することで、特定の条件に合致する原価予算のみを取得することが可能です。

定義
type : 原価種別 (procurement, external_procurement, other_cost) start_amount_excluding_tax : 金額(税抜):下限 end_amount_excluding_tax : 金額(税抜):上限 start_date_period : 発生予定期間:開始日(yyyy-mm-dd) end_date_period : 発生予定期間:終了日(yyyy-mm-dd) master_item_ids : 商品ID(複数指定可) start_quantity : 数量:下限 end_quantity : 数量:上限 start_unit_price : 単価:下限 end_unit_price : 単価:上限 charge_employee_ids : 社内担当者の従業員ID(複数指定可) reporting_section_ids ...

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |
|  |  | いいえ |  |  |

### レスポンス (200)

### POST /cost_budgets

操作: 原価予算登録

説明: 概要 原価予算を新規登録します。 type で原価種別を指定してください。procurement（仕入）はリクエストスキーマが異なります。external_procurement（外部仕入）と other_cost（その他原価）は同じリクエストスキーマを使用します。

定義
全type共通フィールド type (必須) : 原価種別 (procurement: 仕入, external_procurement: 外部仕入, other_cost: その他原価) period_from_date (必須) : 期間開始日 period_to_date (必須) : 期間終了日。period_from_date と両方必須。 business_id : 案件ID memo : 備考 charge_employee_id : 社内担当者ID reporting_section_id : 担当部門ID type=procurement 固有フィールド quantity (必須) : 数量 unit_price (必須) : 単価 deal_line_type_id (必須) : 明細取引タイプI...

### レスポンス (201)

### GET /cost_budgets/{id}

操作: 原価予算詳細取得

説明: 概要 指定されたIDの原価予算の詳細情報を取得します。

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
|  |  | いいえ |  |  |
| id | path | はい | string | 原価予算ID |

### レスポンス (200)

### PATCH /cost_budgets/{id}

操作: 原価予算更新

説明: 概要 指定されたIDの原価予算を更新します。 原価種別に応じて使用可能なフィールドが異なります。 送信したフィールドのみ更新されます。 なお原価種別を変更することはできません。

定義
全type共通フィールド period_from_date : 期間開始日。period_to_date と両方同時に送信する必要がある。 period_to_date : 期間終了日。period_from_date と両方同時に送信する必要がある。 business_id : 案件ID memo : 備考 charge_employee_id : 社内担当者ID reporting_section_id : 担当部門ID type=procurement 固有フィールド（外部仕入・その他原価では送信不可） quantity : 数量 unit_price : 単価 deal_line_type_id : 明細取引タイプID supplier_id : 仕入先ID payment_partner_id : 支払先ID uom_name : 単位 master_item_id : 商品ID account...

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | string | 原価予算ID |

### レスポンス (200)

### POST /cost_budgets/{id}/cancellation

操作: 原価予算取消

説明: 概要 指定されたIDの原価予算を取消します。

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | string | 原価予算ID |

### レスポンス (200)



## 参考情報

- freee API公式ドキュメント: https://developer.freee.co.jp/docs
