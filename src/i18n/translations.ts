import type { AppLanguage } from '../types';

type TranslationKeys = {
  // Навигация
  nav_calculator: string;
  nav_warehouse: string;
  nav_spools: string;
  nav_printers: string;
  nav_history: string;
  nav_profit: string;
  nav_settings: string;

  // Настройки
  settings_title: string;
  settings_reset: string;
  settings_appearance: string;
  settings_dark_theme: string;
  settings_language: string;
  settings_electricity: string;
  settings_electricity_cost: string;
  settings_power: string;
  settings_printer_defaults: string;
  settings_printer_life: string;
  settings_profit_default: string;
  settings_profit_percent: string;
  settings_backup: string;
  settings_backup_desc: string;
  settings_export: string;
  settings_import: string;
  settings_import_ok: string;
  settings_import_error: string;
  settings_backup_tip: string;
  settings_data_local: string;

  // Расчёт
  calc_import_gcode: string;
  calc_clear: string;
  calc_gcode_hint: string;
  calc_main_params: string;
  calc_part_name: string;
  calc_spool_profile: string;
  calc_spool_label: string;
  calc_printer_profile: string;
  calc_spool_price: string;
  calc_spool_weight: string;
  calc_part_weight: string;
  calc_model_weight: string;
  calc_print_time: string;
  calc_hours: string;
  calc_minutes: string;
  calc_electricity: string;
  calc_electricity_cost: string;
  calc_power: string;
  calc_printer_cost: string;
  calc_printer_life: string;
  calc_complexity: string;
  calc_quantity: string;
  calc_processing: string;
  calc_extra_costs: string;
  calc_extra_costs_hint: string;
  calc_add_from_warehouse: string;
  calc_profit: string;
  calc_profit_percent: string;
  calc_profit_fixed: string;
  calc_rounding: string;
  calc_rounding_desc: string;
  calc_calculate: string;
  calc_results: string;
  calc_cost_price: string;
  calc_price_per_piece: string;
  calc_total: string;
  calc_save: string;

  // Склад
  wh_title: string;
  wh_add: string;
  wh_empty: string;
  wh_search: string;
  wh_category: string;
  wh_all: string;
  wh_name: string;
  wh_price: string;
  wh_quantity: string;
  wh_sum: string;
  wh_total_value: string;
  wh_total_units: string;
  wh_categories: string;
  wh_edit: string;
  wh_delete: string;
  wh_delete_title: string;
  wh_delete_msg: string;
  wh_new_item: string;
  wh_edit_item: string;
  wh_unit: string;
  wh_note: string;
  wh_save: string;
  wh_cancel: string;

  // Категории склада
  wh_cat_filament: string;
  wh_cat_parts: string;
  wh_cat_fasteners: string;
  wh_cat_electronics: string;
  wh_cat_paint: string;
  wh_cat_packaging: string;
  wh_cat_tools: string;
  wh_cat_other: string;

  // Катушки
  spools_title: string;
  spools_add: string;
  spools_empty: string;
  spools_add_first: string;
  spools_import: string;
  spools_new: string;
  spools_edit: string;
  spools_name: string;
  spools_type: string;
  spools_color: string;
  spools_price: string;
  spools_weight: string;
  spools_note: string;
  spools_save: string;
  spools_cancel: string;
  spools_delete_title: string;
  spools_delete_msg: string;
  spools_cost_per_gram: string;

  // Принтеры
  printers_title: string;
  printers_add: string;
  printers_empty: string;
  printers_add_first: string;
  printers_new: string;
  printers_edit: string;
  printers_name: string;
  printers_power: string;
  printers_cost: string;
  printers_life: string;
  printers_life_hint: string;
  printers_wear: string;
  printers_note: string;
  printers_save: string;
  printers_cancel: string;
  printers_delete_title: string;
  printers_delete_msg: string;

  // Общее
  common_save: string;
  common_cancel: string;
  common_delete: string;
  common_edit: string;
  common_add: string;
  common_close: string;
  common_copy: string;
  common_confirm: string;
  common_search: string;
  common_no_results: string;
  common_loading: string;
  common_rub: string;
  common_hours: string;
  common_watts: string;
  common_grams: string;
  common_pieces: string;
  common_type: string;
  common_weight: string;
  common_price: string;
  common_cost: string;
  common_note: string;
  common_name: string;
  common_default_label: string;
  common_power: string;
  common_lifespan: string;
  common_optional: string;
  common_select_all: string;
  common_deselect_all: string;
  common_reading: string;
  common_hour_short: string;
  common_min_short: string;

  // Настройки — дополнительные
  settings_elec_tooltip: string;
  settings_loaded_prefix: string;
  settings_spools_n: string;
  settings_printers_n: string;
  settings_projects_n: string;
  settings_history_n: string;

  // Катушки — дополнительные
  spools_per_gram_label: string;
  spools_import_tooltip: string;
  spools_default_weight: string;
  spools_how_to_import_title: string;
  spools_select_zip: string;
  spools_import_select_title: string;
  spools_import_found: string;
  spools_import_selected: string;
  spools_import_note: string;
  spools_optional_note: string;

  // Принтеры — дополнительные
  printers_wear_label: string;
  printers_optional_note: string;
  printers_name_label: string;
  printers_hour_short: string;

  // Склад — дополнительные
  wh_positions: string;
  wh_price_per_unit: string;
  wh_total_stat: string;
  wh_units_stat: string;
  wh_cat_stat: string;
  wh_optional_note: string;

  // Калькулятор — дополнительные
  calc_material: string;
  calc_printer_elec: string;
  calc_not_selected: string;
  calc_from_profile: string;
  calc_default_1000g: string;
  calc_type_label: string;
  calc_gram_price_label: string;
  calc_wholesale: string;
  calc_wholesale_desc: string;
  calc_wholesale_discount: string;
  calc_wholesale_default: string;
  calc_complexity_desc: string;
  calc_with_supports: string;
  calc_without_supports: string;
  calc_model_weight_missing: string;
  calc_model_weight_tooltip: string;
  calc_colorful: string;
  calc_auto_computed: string;
  calc_add_custom: string;
  calc_fixed_sum: string;
  calc_per_gram: string;
  calc_per_gram_rate: string;
  calc_round_price: string;
  calc_fill_form: string;
  calc_fill_form_desc: string;
  calc_gcode_no_data: string;
  calc_quantity_parts: string;
  calc_spool_placeholder: string;
  calc_part_name_placeholder: string;

  // История — дополнительные
  hist_title: string;
  hist_clear_all: string;
  hist_empty: string;
  hist_empty_desc: string;
  hist_search: string;
  hist_sort: string;
  hist_by_date: string;
  hist_by_price: string;
  hist_by_name: string;
  hist_restore: string;
  hist_to_profit: string;
  hist_cost_sheet: string;
  hist_comment: string;
  hist_edit_comment: string;
  hist_delete_title: string;
  hist_delete_msg: string;
  hist_delete_all_title: string;
  hist_delete_all_msg: string;
  hist_no_project: string;
  hist_new_project: string;
  hist_manage_projects: string;
  hist_assign_project: string;
  hist_material: string;
  hist_printer: string;
  hist_part_weight: string;
  hist_print_time: string;
  hist_qty: string;
  hist_price_per_piece: string;
  hist_total: string;
  hist_defect_rate: string;
  hist_adjusted_price: string;
  hist_project_total: string;
  hist_copied: string;
  hist_copy_text: string;
  hist_print: string;
  hist_printer_label: string;
  hist_add_to_profit: string;
  hist_cost_sheet_tooltip: string;
  hist_load_to_form: string;
  hist_add_comment: string;
  hist_hide_details: string;
  hist_show_details: string;
  hist_no_name: string;
  hist_one_project: string;
  hist_projects_n: string;
  hist_fixed_short: string;
  hist_note_placeholder: string;
  hist_confirm_delete_msg: string;
  hist_from_date: string;
  hist_no_records: string;
  hist_not_found: string;
  hist_search_placeholder: string;
  hist_rename_project: string;
  hist_project_name: string;
  hist_project_delete_msg: string;
  common_create: string;

  // Прибыль — дополнительные
  profit_title: string;
  profit_add: string;
  profit_empty: string;
  profit_empty_desc: string;
  profit_add_manual: string;
  profit_positions: string;
  profit_items: string;
  profit_revenue: string;
  profit_cost: string;
  profit_net: string;
  profit_search: string;
  profit_table: string;
  profit_chart: string;
  profit_name: string;
  profit_qty: string;
  profit_cost_col: string;
  profit_sale: string;
  profit_sum: string;
  profit_from_history: string;
  profit_total_revenue: string;
  profit_total_cost: string;
  profit_total_net: string;
  profit_edit_title: string;
  profit_new_title: string;
  profit_item_name: string;
  profit_item_qty: string;
  profit_item_cost: string;
  profit_item_sale: string;
  profit_col_cost: string;
  profit_col_price: string;
  profit_delete_msg: string;
  common_confirm_delete: string;
  // ResultsPanel
  res_before_rounding: string;
  res_profit: string;
  res_price_per_gram: string;
  res_batch: string;
  res_pieces: string;
  res_total_cost: string;
  res_total_profit: string;
  res_total_for: string;
  res_batch_before_rounding: string;
  res_after: string;
  res_profit_of_cost: string;
  res_fixed_profit: string;
  res_hide_simulator: string;
  res_show_simulator: string;
  res_simulator_label: string;
  res_current: string;
  res_preview: string;
  res_piece_short: string;
  res_total_short: string;
  res_margin_at: string;
  res_of_price: string;
  // BreakdownPanel
  brk_title: string;
  brk_material: string;
  brk_electricity: string;
  brk_printer_wear: string;
  brk_processing: string;
  brk_extra: string;
  brk_profit: string;
  brk_total: string;
  app_order_sum: string;
  app_total_profit: string;
  app_save_calc: string;
  app_select_projects: string;
  app_save_no_project: string;
  app_welcome_title: string;
  app_welcome_desc: string;
  app_onboard_step1: string;
  app_skip: string;
  app_start: string;
  app_clear_form_title: string;
  app_clear_form_desc: string;
  common_next: string;
};

const ru: TranslationKeys = {
  nav_calculator: 'Расчёт',
  nav_warehouse: 'Склад',
  nav_spools: 'Катушки',
  nav_printers: 'Принтеры',
  nav_history: 'История',
  nav_profit: 'Прибыль',
  nav_settings: 'Настройки',

  settings_title: 'Настройки',
  settings_reset: 'Сбросить умолчания',
  settings_appearance: 'Внешний вид',
  settings_dark_theme: 'Тёмная тема',
  settings_language: 'Язык',
  settings_electricity: 'Электроэнергия (по умолчанию)',
  settings_electricity_cost: 'Стоимость кВт⋅ч',
  settings_power: 'Мощность принтера',
  settings_printer_defaults: 'Принтер (по умолчанию)',
  settings_printer_life: 'Срок службы принтера',
  settings_profit_default: 'Прибыль (по умолчанию)',
  settings_profit_percent: 'Процент прибыли',
  settings_backup: 'Резервная копия данных',
  settings_backup_desc: 'Экспорт сохраняет все катушки, принтеры, историю расчётов и настройки в один JSON-файл. При импорте все текущие данные полностью заменяются данными из файла.',
  settings_export: 'Скачать резервную копию',
  settings_import: 'Загрузить из файла',
  settings_import_ok: 'Данные успешно загружены.',
  settings_import_error: 'Файл повреждён или неверного формата',
  settings_backup_tip: 'Все данные хранятся локально. Рекомендуем периодически делать резервную копию.',
  settings_data_local: 'Данные хранятся локально на этом устройстве. Сервер не используется.',

  calc_import_gcode: 'Импорт G-code',
  calc_clear: 'Очистить',
  calc_gcode_hint: 'PrusaSlicer, OrcaSlicer, Cura — автозаполнение веса и времени',
  calc_main_params: 'Основные параметры',
  calc_part_name: 'Название детали',
  calc_spool_profile: 'Профиль катушки',
  calc_spool_label: 'Катушка',
  calc_printer_profile: 'Профиль принтера',
  calc_spool_price: 'Цена катушки',
  calc_spool_weight: 'Вес катушки',
  calc_part_weight: 'Вес детали (с поддержками)',
  calc_model_weight: 'Вес модели (без поддержек)',
  calc_print_time: 'Время печати',
  calc_hours: 'ч',
  calc_minutes: 'мин',
  calc_electricity: 'Электроэнергия',
  calc_electricity_cost: 'Стоимость кВт⋅ч',
  calc_power: 'Мощность',
  calc_printer_cost: 'Стоимость принтера',
  calc_printer_life: 'Срок службы',
  calc_complexity: 'Сложность модели',
  calc_quantity: 'Количество',
  calc_processing: 'Обработка',
  calc_extra_costs: 'Дополнительные расходы',
  calc_extra_costs_hint: 'Доставка, расходники, аренда — всё что не входит в другие категории',
  calc_add_from_warehouse: 'Добавить со склада',
  calc_profit: 'Прибыль',
  calc_profit_percent: 'Процент',
  calc_profit_fixed: 'Фиксированная сумма',
  calc_rounding: 'Округление цены',
  calc_rounding_desc: 'До ₽1 (до ₽5, до ₽10 или до ₽50 — автоматически в зависимости от суммы)',
  calc_calculate: 'Рассчитать',
  calc_results: 'Результаты',
  calc_cost_price: 'Себестоимость',
  calc_price_per_piece: 'Цена за штуку',
  calc_total: 'Итого',
  calc_save: 'Сохранить расчёт',

  wh_title: 'Склад',
  wh_add: 'Добавить',
  wh_empty: 'Склад пуст. Добавьте первую позицию!',
  wh_search: 'Поиск…',
  wh_category: 'Категория',
  wh_all: 'Все',
  wh_name: 'Название',
  wh_price: 'Цена',
  wh_quantity: 'Кол-во',
  wh_sum: 'Сумма',
  wh_total_value: 'Общая стоимость',
  wh_total_units: 'Всего единиц',
  wh_categories: 'Категорий',
  wh_edit: 'Редактировать',
  wh_delete: 'Удалить',
  wh_delete_title: 'Удалить позицию?',
  wh_delete_msg: 'будет удалена со склада.',
  wh_new_item: 'Новая позиция',
  wh_edit_item: 'Редактировать позицию',
  wh_unit: 'Ед.',
  wh_note: 'Заметка',
  wh_save: 'Сохранить',
  wh_cancel: 'Отмена',

  wh_cat_filament: 'Филамент',
  wh_cat_parts: 'Комплектующие',
  wh_cat_fasteners: 'Крепеж',
  wh_cat_electronics: 'Электроника',
  wh_cat_paint: 'Краска/Лак',
  wh_cat_packaging: 'Упаковка',
  wh_cat_tools: 'Инструмент',
  wh_cat_other: 'Другое',

  spools_title: 'Катушки с пластиком',
  spools_add: 'Добавить',
  spools_empty: 'Профили катушек отсутствуют',
  spools_add_first: 'Добавить первую катушку',
  spools_import: 'Импорт из Slicer',
  spools_new: 'Новая катушка',
  spools_edit: 'Редактировать катушку',
  spools_name: 'Название',
  spools_type: 'Тип пластика',
  spools_color: 'Цвет',
  spools_price: 'Цена катушки',
  spools_weight: 'Вес катушки',
  spools_note: 'Примечание',
  spools_save: 'Сохранить',
  spools_cancel: 'Отмена',
  spools_delete_title: 'Удалить катушку?',
  spools_delete_msg: 'будет удалён без возможности восстановления.',
  spools_cost_per_gram: 'Стоимость за грамм',

  printers_title: 'Принтеры',
  printers_add: 'Добавить',
  printers_empty: 'Профили принтеров отсутствуют',
  printers_add_first: 'Добавить первый принтер',
  printers_new: 'Новый принтер',
  printers_edit: 'Редактировать принтер',
  printers_name: 'Название',
  printers_power: 'Потребляемая мощность',
  printers_cost: 'Стоимость принтера',
  printers_life: 'Срок службы',
  printers_life_hint: 'По умолчанию 3000 часов',
  printers_wear: 'Износ за 1 час печати',
  printers_note: 'Примечание',
  printers_save: 'Сохранить',
  printers_cancel: 'Отмена',
  printers_delete_title: 'Удалить принтер?',
  printers_delete_msg: 'будет удалён без возможности восстановления.',

  common_save: 'Сохранить',
  common_cancel: 'Отмена',
  common_delete: 'Удалить',
  common_edit: 'Редактировать',
  common_add: 'Добавить',
  common_close: 'Закрыть',
  common_copy: 'Копировать',
  common_confirm: 'Подтвердить',
  common_search: 'Поиск…',
  common_no_results: 'Ничего не найдено',
  common_loading: 'Загрузка…',
  common_rub: '₽',
  common_hours: 'часов',
  common_watts: 'Вт',
  common_grams: 'г',
  common_pieces: 'шт',
  common_type: 'Тип',
  common_weight: 'Вес',
  common_price: 'Цена',
  common_cost: 'Стоимость',
  common_note: 'Примечание',
  common_name: 'Название',
  common_default_label: 'По умолчанию',
  common_power: 'Мощность',
  common_lifespan: 'Срок службы',
  common_optional: '(необязательно)',
  common_select_all: 'Выбрать всё',
  common_deselect_all: 'Снять всё',
  common_reading: 'Читаю архив…',
  common_hour_short: 'ч',
  common_min_short: 'мин',

  settings_elec_tooltip: 'Эти значения применяются при создании нового расчёта, если не выбран профиль принтера',
  settings_loaded_prefix: 'Загружено:',
  settings_spools_n: 'катушек',
  settings_printers_n: 'принтеров',
  settings_projects_n: 'проектов',
  settings_history_n: 'записей истории',

  spools_per_gram_label: 'Цена за 1 г',
  spools_import_tooltip: 'Импорт пресетов из слайсера (OrcaSlicer, PrusaSlicer)',
  spools_default_weight: 'По умолчанию 1000 г',
  spools_how_to_import_title: 'Как экспортировать пресеты филамента из слайсера',
  spools_select_zip: 'Выбрать ZIP-файл…',
  spools_import_select_title: 'Выберите пресеты для импорта',
  spools_import_found: 'Найдено',
  spools_import_selected: 'Выбрано',
  spools_import_note: 'Цена из OrcaSlicer — это цена за кг (катушка 1000 г). После импорта можно отредактировать каждую катушку.',
  spools_optional_note: 'Примечание (необязательно)',

  printers_wear_label: 'Износ за 1 час печати',
  printers_optional_note: 'Примечание (необязательно)',
  printers_name_label: 'Название принтера',
  printers_hour_short: 'ч',

  wh_positions: 'поз.',
  wh_price_per_unit: 'Цена за единицу',
  wh_total_stat: 'Общая стоимость',
  wh_units_stat: 'Всего единиц',
  wh_cat_stat: 'Категорий',
  wh_optional_note: 'Заметка',

  calc_material: 'Материал',
  calc_printer_elec: 'Принтер и электроэнергия',
  calc_not_selected: 'Не выбран',
  calc_from_profile: 'Из профиля — можно изменить вручную',
  calc_default_1000g: 'По умолчанию 1000 г',
  calc_type_label: 'Тип:',
  calc_gram_price_label: 'Цена 1 г:',
  calc_wholesale: 'Оптовый заказ',
  calc_wholesale_desc: 'Скидка на цену каждой детали',
  calc_wholesale_discount: 'Скидка за шт.',
  calc_wholesale_default: 'По умолчанию 10%',
  calc_complexity_desc: 'Коэффициент сложности учитывает сложность геометрии, количество поддержек и риск брака.',
  calc_with_supports: 'Включая поддержки и юбку',
  calc_without_supports: 'Только модель, без поддержек',
  calc_model_weight_missing: 'Не найден в G-code — введите вручную если есть поддержки',
  calc_model_weight_tooltip: 'Слайсер не записал вес модели отдельно. Если в модели есть поддержки или юбка — введите вес модели вручную. Если оставить пустым, расчёт будет по общему весу филамента.',
  calc_colorful: '🌈 Цветная',
  calc_auto_computed: 'Авто · можно изменить',
  calc_add_custom: 'Добавить свой этап',
  calc_fixed_sum: 'Фикс',
  calc_per_gram: 'за г',
  calc_per_gram_rate: 'Ставка ₽/г',
  calc_round_price: 'Округление цены',
  calc_fill_form: 'Заполните форму расчёта',
  calc_fill_form_desc: 'Введите вес детали или время печати — результаты появятся здесь',
  calc_gcode_no_data: 'Не удалось распознать данные в файле',
  calc_quantity_parts: 'Количество деталей',
  calc_spool_placeholder: 'Например: Крышка корпуса',
  calc_part_name_placeholder: 'Например: Крышка корпуса',

  hist_title: 'История расчётов',
  hist_clear_all: 'Очистить историю',
  hist_empty: 'История пуста',
  hist_empty_desc: 'Сохраните первый расчёт, чтобы он появился здесь',
  hist_search: 'Поиск по истории…',
  hist_sort: 'Сортировка',
  hist_by_date: 'По дате',
  hist_by_price: 'По цене',
  hist_by_name: 'По названию',
  hist_restore: 'Восстановить в форму',
  hist_to_profit: 'В прибыль',
  hist_cost_sheet: 'Кошт-лист',
  hist_comment: 'Комментарий',
  hist_edit_comment: 'Изменить комментарий',
  hist_delete_title: 'Удалить расчёт?',
  hist_delete_msg: 'будет удалён из истории без возможности восстановления.',
  hist_delete_all_title: 'Очистить всю историю?',
  hist_delete_all_msg: 'Все расчёты будут удалены. Это действие нельзя отменить.',
  hist_no_project: 'Без проекта',
  hist_new_project: 'Новый проект',
  hist_manage_projects: 'Управление проектами',
  hist_assign_project: 'Добавить в проект',
  hist_material: 'Материал',
  hist_printer: 'Принтер',
  hist_part_weight: 'Вес изделия',
  hist_print_time: 'Время печати',
  hist_qty: 'Количество',
  hist_price_per_piece: 'Цена за 1 шт.',
  hist_total: 'Итого',
  hist_defect_rate: 'Процент брака',
  hist_adjusted_price: 'Скорректированная цена',
  hist_project_total: 'Итого по проекту',
  hist_copied: 'Скопировано',
  hist_copy_text: 'Скопировать текст',
  hist_print: 'Распечатать',
  hist_printer_label: 'Принтер',
  hist_add_to_profit: 'Добавить в таблицу прибыли',
  hist_cost_sheet_tooltip: 'Кошт-лист (для заказчика)',
  hist_load_to_form: 'Загрузить в форму',
  hist_add_comment: 'Добавить комментарий',
  hist_hide_details: 'Скрыть детали',
  hist_show_details: 'Показать детали',
  hist_no_name: 'Без названия',
  hist_one_project: '1 проект',
  hist_projects_n: 'проекта',
  hist_fixed_short: 'фикс.',
  hist_note_placeholder: 'Комментарий к расчёту (Ctrl+Enter — сохранить, Esc — отмена)...',
  hist_confirm_delete_msg: 'Расчёт',
  hist_from_date: 'будет удалён.',
  hist_no_records: 'Записей пока нет',
  hist_not_found: 'Ничего не найдено по запросу',
  hist_search_placeholder: 'Поиск по названию...',
  hist_rename_project: 'Переименовать проект',
  hist_project_name: 'Название проекта',
  hist_project_delete_msg: 'Проект будет удалён. Расчёты останутся в истории.',
  common_create: 'Создать',

  profit_title: 'Таблица прибыли',
  profit_add: 'Добавить запись',
  profit_empty: 'Записей пока нет',
  profit_empty_desc: 'Добавьте расчёт из истории кнопкой «В прибыль» или создайте запись вручную',
  profit_add_manual: 'Добавить вручную',
  profit_positions: 'Позиций / изделий',
  profit_items: 'шт.',
  profit_revenue: 'Выручка',
  profit_cost: 'Себестоимость',
  profit_net: 'Чистая прибыль',
  profit_search: 'Поиск по названию..',
  profit_table: 'ТАБЛИЦА',
  profit_chart: 'ГРАФИК',
  profit_name: 'Название',
  profit_qty: 'Кол-во',
  profit_cost_col: 'Себест.',
  profit_sale: 'Цена прод.',
  profit_sum: 'Выручка',
  profit_from_history: 'из истории',
  profit_total_revenue: 'Итого выручка:',
  profit_total_cost: 'Себестоимость:',
  profit_total_net: 'Чистая прибыль:',
  profit_edit_title: 'Редактировать запись',
  profit_new_title: 'Добавить запись',
  profit_item_name: 'Название позиции',
  profit_item_qty: 'Количество',
  profit_item_cost: 'Себестоимость за шт.',
  profit_item_sale: 'Цена продажи за шт.',
  profit_col_cost: 'Себест. / шт.',
  profit_col_price: 'Цена / шт.',
  profit_delete_msg: 'Запись будет удалена из таблицы прибыли.',
  common_confirm_delete: 'Удалить запись?',
  // ResultsPanel
  res_before_rounding: 'До округления:',
  res_profit: 'Прибыль',
  res_price_per_gram: 'Цена/грамм',
  res_batch: 'Партия',
  res_pieces: 'шт.',
  res_total_cost: 'Общая себестоимость',
  res_total_profit: 'Общая прибыль',
  res_total_for: 'Итого за',
  res_batch_before_rounding: 'До округления партии:',
  res_after: 'После:',
  res_profit_of_cost: 'от себестоимости',
  res_fixed_profit: 'Фиксированная прибыль',
  res_hide_simulator: 'Скрыть симулятор цены',
  res_show_simulator: 'Симулятор цены — что будет при другом % прибыли',
  res_simulator_label: 'Симулятор % прибыли',
  res_current: 'Текущая',
  res_preview: 'Предпросмотр',
  res_piece_short: 'шт.',
  res_total_short: 'всего',
  res_margin_at: 'Маржа при',
  res_of_price: 'от цены',
  // BreakdownPanel
  brk_title: 'Разбивка себестоимости',
  brk_material: 'Материал',
  brk_electricity: 'Электроэнергия',
  brk_printer_wear: 'Износ принтера',
  brk_processing: 'Обработка',
  brk_extra: 'Доп. расходы',
  brk_profit: 'Прибыль',
  brk_total: 'Итого',
  app_order_sum: 'Сумма заказов',
  app_total_profit: 'Суммарная прибыль',
  app_save_calc: 'Сохранить расчёт',
  app_select_projects: 'Выберите один или несколько проектов',
  app_save_no_project: 'Без проекта',
  app_welcome_title: 'Добро пожаловать в PriceFDM!',
  app_welcome_desc: 'Три шага — и вы готовы считать стоимость печати',
  app_onboard_step1: 'Добавьте принтер',
  app_skip: 'Пропустить',
  app_start: 'Начать работу',
  app_clear_form_title: 'Очистить форму?',
  app_clear_form_desc: 'Все введённые значения будут сброшены к значениям по умолчанию.',
  common_next: 'Далее',
};

const en: TranslationKeys = {
  nav_calculator: 'Calculator',
  nav_warehouse: 'Warehouse',
  nav_spools: 'Spools',
  nav_printers: 'Printers',
  nav_history: 'History',
  nav_profit: 'Profit',
  nav_settings: 'Settings',

  settings_title: 'Settings',
  settings_reset: 'Reset defaults',
  settings_appearance: 'Appearance',
  settings_dark_theme: 'Dark theme',
  settings_language: 'Language',
  settings_electricity: 'Electricity (default)',
  settings_electricity_cost: 'Cost per kWh',
  settings_power: 'Printer power',
  settings_printer_defaults: 'Printer (default)',
  settings_printer_life: 'Printer lifespan',
  settings_profit_default: 'Profit (default)',
  settings_profit_percent: 'Profit percentage',
  settings_backup: 'Data backup',
  settings_backup_desc: 'Export saves all spools, printers, calculation history and settings into a single JSON file. On import, all current data is completely replaced with the file data.',
  settings_export: 'Download backup',
  settings_import: 'Load from file',
  settings_import_ok: 'Data loaded successfully.',
  settings_import_error: 'File is corrupted or invalid format',
  settings_backup_tip: 'All data is stored locally. We recommend making backups periodically.',
  settings_data_local: 'Data is stored locally on this device. No server is used.',

  calc_import_gcode: 'Import G-code',
  calc_clear: 'Clear',
  calc_gcode_hint: 'PrusaSlicer, OrcaSlicer, Cura — auto-fill weight and time',
  calc_main_params: 'Main parameters',
  calc_part_name: 'Part name',
  calc_spool_profile: 'Spool profile',
  calc_spool_label: 'Spool',
  calc_printer_profile: 'Printer profile',
  calc_spool_price: 'Spool price',
  calc_spool_weight: 'Spool weight',
  calc_part_weight: 'Part weight (with supports)',
  calc_model_weight: 'Model weight (without supports)',
  calc_print_time: 'Print time',
  calc_hours: 'h',
  calc_minutes: 'min',
  calc_electricity: 'Electricity',
  calc_electricity_cost: 'Cost per kWh',
  calc_power: 'Power',
  calc_printer_cost: 'Printer cost',
  calc_printer_life: 'Lifespan',
  calc_complexity: 'Model complexity',
  calc_quantity: 'Quantity',
  calc_processing: 'Post-processing',
  calc_extra_costs: 'Additional costs',
  calc_extra_costs_hint: 'Delivery, consumables, rent — everything not in other categories',
  calc_add_from_warehouse: 'Add from warehouse',
  calc_profit: 'Profit',
  calc_profit_percent: 'Percentage',
  calc_profit_fixed: 'Fixed amount',
  calc_rounding: 'Price rounding',
  calc_rounding_desc: 'To ₽1 (to ₽5, ₽10 or ₽50 — automatic based on amount)',
  calc_calculate: 'Calculate',
  calc_results: 'Results',
  calc_cost_price: 'Cost price',
  calc_price_per_piece: 'Price per piece',
  calc_total: 'Total',
  calc_save: 'Save calculation',

  wh_title: 'Warehouse',
  wh_add: 'Add',
  wh_empty: 'Warehouse is empty. Add your first item!',
  wh_search: 'Search…',
  wh_category: 'Category',
  wh_all: 'All',
  wh_name: 'Name',
  wh_price: 'Price',
  wh_quantity: 'Qty',
  wh_sum: 'Sum',
  wh_total_value: 'Total value',
  wh_total_units: 'Total units',
  wh_categories: 'Categories',
  wh_edit: 'Edit',
  wh_delete: 'Delete',
  wh_delete_title: 'Delete item?',
  wh_delete_msg: 'will be removed from warehouse.',
  wh_new_item: 'New item',
  wh_edit_item: 'Edit item',
  wh_unit: 'Unit',
  wh_note: 'Note',
  wh_save: 'Save',
  wh_cancel: 'Cancel',

  wh_cat_filament: 'Filament',
  wh_cat_parts: 'Components',
  wh_cat_fasteners: 'Fasteners',
  wh_cat_electronics: 'Electronics',
  wh_cat_paint: 'Paint/Lacquer',
  wh_cat_packaging: 'Packaging',
  wh_cat_tools: 'Tools',
  wh_cat_other: 'Other',

  spools_title: 'Filament spools',
  spools_add: 'Add',
  spools_empty: 'No spool profiles',
  spools_add_first: 'Add first spool',
  spools_import: 'Import from Slicer',
  spools_new: 'New spool',
  spools_edit: 'Edit spool',
  spools_name: 'Name',
  spools_type: 'Plastic type',
  spools_color: 'Color',
  spools_price: 'Spool price',
  spools_weight: 'Spool weight',
  spools_note: 'Note',
  spools_save: 'Save',
  spools_cancel: 'Cancel',
  spools_delete_title: 'Delete spool?',
  spools_delete_msg: 'will be deleted permanently.',
  spools_cost_per_gram: 'Cost per gram',

  printers_title: 'Printers',
  printers_add: 'Add',
  printers_empty: 'No printer profiles',
  printers_add_first: 'Add first printer',
  printers_new: 'New printer',
  printers_edit: 'Edit printer',
  printers_name: 'Name',
  printers_power: 'Power consumption',
  printers_cost: 'Printer cost',
  printers_life: 'Lifespan',
  printers_life_hint: 'Default 3000 hours',
  printers_wear: 'Wear per 1 hour',
  printers_note: 'Note',
  printers_save: 'Save',
  printers_cancel: 'Cancel',
  printers_delete_title: 'Delete printer?',
  printers_delete_msg: 'will be deleted permanently.',

  common_save: 'Save',
  common_cancel: 'Cancel',
  common_delete: 'Delete',
  common_edit: 'Edit',
  common_add: 'Add',
  common_close: 'Close',
  common_copy: 'Copy',
  common_confirm: 'Confirm',
  common_search: 'Search…',
  common_no_results: 'Nothing found',
  common_loading: 'Loading…',
  common_rub: '₽',
  common_hours: 'hours',
  common_watts: 'W',
  common_grams: 'g',
  common_pieces: 'pcs',
  common_type: 'Type',
  common_weight: 'Weight',
  common_price: 'Price',
  common_cost: 'Cost',
  common_note: 'Note',
  common_name: 'Name',
  common_default_label: 'Default',
  common_power: 'Power',
  common_lifespan: 'Lifespan',
  common_optional: '(optional)',
  common_select_all: 'Select all',
  common_deselect_all: 'Deselect all',
  common_reading: 'Reading archive…',
  common_hour_short: 'h',
  common_min_short: 'min',

  settings_elec_tooltip: 'These values are used when creating a new calculation if no printer profile is selected',
  settings_loaded_prefix: 'Loaded:',
  settings_spools_n: 'spools',
  settings_printers_n: 'printers',
  settings_projects_n: 'projects',
  settings_history_n: 'history entries',

  spools_per_gram_label: 'Price per 1 g',
  spools_import_tooltip: 'Import presets from slicer (OrcaSlicer, PrusaSlicer)',
  spools_default_weight: 'Default 1000 g',
  spools_how_to_import_title: 'How to export filament presets from your slicer',
  spools_select_zip: 'Select ZIP file…',
  spools_import_select_title: 'Select presets to import',
  spools_import_found: 'Found',
  spools_import_selected: 'Selected',
  spools_import_note: 'Price from OrcaSlicer is per kg (1000 g spool). You can edit each spool after import.',
  spools_optional_note: 'Note (optional)',

  printers_wear_label: 'Wear per 1 hour of printing',
  printers_optional_note: 'Note (optional)',
  printers_name_label: 'Printer name',
  printers_hour_short: 'h',

  wh_positions: 'items',
  wh_price_per_unit: 'Price per unit',
  wh_total_stat: 'Total value',
  wh_units_stat: 'Total units',
  wh_cat_stat: 'Categories',
  wh_optional_note: 'Note',

  calc_material: 'Material',
  calc_printer_elec: 'Printer & electricity',
  calc_not_selected: 'Not selected',
  calc_from_profile: 'From profile — can be edited',
  calc_default_1000g: 'Default 1000 g',
  calc_type_label: 'Type:',
  calc_gram_price_label: 'Price per 1 g:',
  calc_wholesale: 'Wholesale order',
  calc_wholesale_desc: 'Discount per piece',
  calc_wholesale_discount: 'Discount/piece',
  calc_wholesale_default: 'Default 10%',
  calc_complexity_desc: 'The complexity coefficient accounts for geometry, supports and defect risk.',
  calc_with_supports: 'Including supports and brim',
  calc_without_supports: 'Model only, no supports',
  calc_model_weight_missing: 'Not found in G-code — enter manually if supports present',
  calc_model_weight_tooltip: 'The slicer did not record the model weight separately. If the model has supports or a brim — enter the model weight manually. If left empty, the calculation uses the total filament weight.',
  calc_colorful: '🌈 Colorful',
  calc_auto_computed: 'Auto · can be changed',
  calc_add_custom: 'Add custom step',
  calc_fixed_sum: 'Fixed',
  calc_per_gram: 'per g',
  calc_per_gram_rate: 'Rate ₽/g',
  calc_round_price: 'Price rounding',
  calc_fill_form: 'Fill in the form',
  calc_fill_form_desc: 'Enter part weight or print time — results will appear here',
  calc_gcode_no_data: 'Could not read data from file',
  calc_quantity_parts: 'Number of parts',
  calc_spool_placeholder: 'e.g. Housing cover',
  calc_part_name_placeholder: 'e.g. Housing cover',

  hist_title: 'Calculation history',
  hist_clear_all: 'Clear history',
  hist_empty: 'History is empty',
  hist_empty_desc: 'Save your first calculation to see it here',
  hist_search: 'Search history…',
  hist_sort: 'Sort',
  hist_by_date: 'By date',
  hist_by_price: 'By price',
  hist_by_name: 'By name',
  hist_restore: 'Restore to form',
  hist_to_profit: 'To profit',
  hist_cost_sheet: 'Cost sheet',
  hist_comment: 'Comment',
  hist_edit_comment: 'Edit comment',
  hist_delete_title: 'Delete calculation?',
  hist_delete_msg: 'will be permanently deleted from history.',
  hist_delete_all_title: 'Clear all history?',
  hist_delete_all_msg: 'All calculations will be deleted. This cannot be undone.',
  hist_no_project: 'No project',
  hist_new_project: 'New project',
  hist_manage_projects: 'Manage projects',
  hist_assign_project: 'Add to project',
  hist_material: 'Material',
  hist_printer: 'Printer',
  hist_part_weight: 'Part weight',
  hist_print_time: 'Print time',
  hist_qty: 'Quantity',
  hist_price_per_piece: 'Price per piece',
  hist_total: 'Total',
  hist_defect_rate: 'Defect rate',
  hist_adjusted_price: 'Adjusted price',
  hist_project_total: 'Project total',
  hist_copied: 'Copied!',
  hist_copy_text: 'Copy text',
  hist_print: 'Print',
  hist_printer_label: 'Printer',
  hist_add_to_profit: 'Add to profit table',
  hist_cost_sheet_tooltip: 'Cost sheet (for customer)',
  hist_load_to_form: 'Load into form',
  hist_add_comment: 'Add comment',
  hist_hide_details: 'Hide details',
  hist_show_details: 'Show details',
  hist_no_name: 'Untitled',
  hist_one_project: '1 project',
  hist_projects_n: 'projects',
  hist_fixed_short: 'fixed',
  hist_note_placeholder: 'Note for this calculation (Ctrl+Enter to save, Esc to cancel)...',
  hist_confirm_delete_msg: 'Calculation',
  hist_from_date: 'will be deleted.',
  hist_no_records: 'No records yet',
  hist_not_found: 'Nothing found for',
  hist_search_placeholder: 'Search by name...',
  hist_rename_project: 'Rename project',
  hist_project_name: 'Project name',
  hist_project_delete_msg: 'Project will be deleted. Calculations will remain in history.',
  common_create: 'Create',

  profit_title: 'Profit table',
  profit_add: 'Add entry',
  profit_empty: 'No entries yet',
  profit_empty_desc: 'Add a calculation from history using the "To profit" button or create an entry manually',
  profit_add_manual: 'Add manually',
  profit_positions: 'Positions / items',
  profit_items: 'pcs.',
  profit_revenue: 'Revenue',
  profit_cost: 'Cost',
  profit_net: 'Net profit',
  profit_search: 'Search by name..',
  profit_table: 'TABLE',
  profit_chart: 'CHART',
  profit_name: 'Name',
  profit_qty: 'Qty',
  profit_cost_col: 'Cost',
  profit_sale: 'Sale price',
  profit_sum: 'Revenue',
  profit_from_history: 'from history',
  profit_total_revenue: 'Total revenue:',
  profit_total_cost: 'Cost:',
  profit_total_net: 'Net profit:',
  profit_edit_title: 'Edit entry',
  profit_new_title: 'Add entry',
  profit_item_name: 'Item name',
  profit_item_qty: 'Quantity',
  profit_item_cost: 'Cost per piece',
  profit_item_sale: 'Sale price per piece',
  profit_col_cost: 'Cost / pc.',
  profit_col_price: 'Price / pc.',
  profit_delete_msg: 'The entry will be removed from the profit table.',
  common_confirm_delete: 'Delete entry?',
  // ResultsPanel
  res_before_rounding: 'Before rounding:',
  res_profit: 'Profit',
  res_price_per_gram: 'Price/gram',
  res_batch: 'Batch',
  res_pieces: 'pcs.',
  res_total_cost: 'Total cost price',
  res_total_profit: 'Total profit',
  res_total_for: 'Total for',
  res_batch_before_rounding: 'Before batch rounding:',
  res_after: 'After:',
  res_profit_of_cost: 'of cost price',
  res_fixed_profit: 'Fixed profit',
  res_hide_simulator: 'Hide price simulator',
  res_show_simulator: 'Price simulator — what if profit % is different',
  res_simulator_label: 'Profit % simulator',
  res_current: 'Current',
  res_preview: 'Preview',
  res_piece_short: 'pc.',
  res_total_short: 'total',
  res_margin_at: 'Margin at',
  res_of_price: 'of price',
  // BreakdownPanel
  brk_title: 'Cost breakdown',
  brk_material: 'Material',
  brk_electricity: 'Electricity',
  brk_printer_wear: 'Printer wear',
  brk_processing: 'Processing',
  brk_extra: 'Extra costs',
  brk_profit: 'Profit',
  brk_total: 'Total',
  app_order_sum: 'Orders total',
  app_total_profit: 'Total profit',
  app_save_calc: 'Save calculation',
  app_select_projects: 'Select one or more projects',
  app_save_no_project: 'Without project',
  app_welcome_title: 'Welcome to PriceFDM!',
  app_welcome_desc: 'Three steps and you\'re ready to calculate print costs',
  app_onboard_step1: 'Add a printer',
  app_skip: 'Skip',
  app_start: 'Get started',
  app_clear_form_title: 'Clear form?',
  app_clear_form_desc: 'All entered values will be reset to defaults.',
  common_next: 'Next',
};

export const translations: Record<AppLanguage, TranslationKeys> = { ru, en };
export type { TranslationKeys };
