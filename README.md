名称：jotbook

记账软件，用来记录每天的支出，默认数据保存到浏览器本地 IndexedDB。

## Supabase 云端备份

1. 在 Supabase SQL Editor 执行 `supabase/schema.sql` 创建 `accountbook_expenses` 表。
2. 复制 `.env.example` 为 `.env`，填写 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`。
3. 重启本地服务后，在“我的”页面把“数据存储方式”切换为“云端存储”。

当前版本免登录，云端数据用应用自动生成的用户 ID 归属，用户 ID 不在界面直接展示。未开启云端存储时，“我的”页面用 `momo` 占位；开启云端后展示 `momo-1`、`momo-2` 这样按云端资料表写入顺序生成的默认名称，名称会同步到 `accountbook_profiles.display_name`，后续可以和注册登录绑定并允许改名。
用户一旦同步过云端资料，即使切回本地存储，页面也会继续显示已分配的顺序名称。切回本地不会删除云端数据；再次切换云端时会继续增量写入本地新增数据。
免登录阶段的用户 ID 不是密码；后续接入注册登录后应改为 Supabase Auth 的用户身份隔离。
