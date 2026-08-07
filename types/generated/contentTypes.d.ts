import type { Schema, Struct } from '@strapi/strapi';

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    encryptedKey: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'read-only'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::permission'> &
      Schema.Attribute.Private;
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>;
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>;
  };
}

export interface AdminSession extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_sessions';
  info: {
    description: 'Session Manager storage';
    displayName: 'Session';
    name: 'Session';
    pluralName: 'sessions';
    singularName: 'session';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
    i18n: {
      localized: false;
    };
  };
  attributes: {
    absoluteExpiresAt: Schema.Attribute.DateTime & Schema.Attribute.Private;
    childId: Schema.Attribute.String & Schema.Attribute.Private;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    deviceId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    expiresAt: Schema.Attribute.DateTime &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::session'> &
      Schema.Attribute.Private;
    origin: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    sessionId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique;
    status: Schema.Attribute.String & Schema.Attribute.Private;
    type: Schema.Attribute.String & Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    userId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferTokenPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'> &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> &
      Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String;
  };
}

export interface ApiCourseCourse extends Struct.CollectionTypeSchema {
  collectionName: 'courses';
  info: {
    displayName: 'Course';
    pluralName: 'courses';
    singularName: 'course';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    code: Schema.Attribute.UID<'name'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    department: Schema.Attribute.Relation<
      'manyToOne',
      'api::department.department'
    >;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::course.course'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    overall_feedbacks: Schema.Attribute.Relation<
      'oneToMany',
      'api::overall-feedback.overall-feedback'
    >;
    publishedAt: Schema.Attribute.DateTime;
    students: Schema.Attribute.Relation<'oneToMany', 'api::student.student'>;
    subjects: Schema.Attribute.Relation<'oneToMany', 'api::subject.subject'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiDepartmentDepartment extends Struct.CollectionTypeSchema {
  collectionName: 'departments';
  info: {
    displayName: 'Department';
    pluralName: 'departments';
    singularName: 'department';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    code: Schema.Attribute.UID<'name'>;
    courses: Schema.Attribute.Relation<'oneToMany', 'api::course.course'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::department.department'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    teachers: Schema.Attribute.Relation<'oneToMany', 'api::teacher.teacher'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiEvaluationBatchEvaluationBatch
  extends Struct.CollectionTypeSchema {
  collectionName: 'evaluation_batches';
  info: {
    displayName: 'EvaluationBatch';
    pluralName: 'evaluation-batches';
    singularName: 'evaluation-batch';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    course: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.Date;
    days_time: Schema.Attribute.String;
    department: Schema.Attribute.String;
    evaluation_type: Schema.Attribute.Relation<
      'manyToOne',
      'api::evaluation-type.evaluation-type'
    >;
    evaluations: Schema.Attribute.Relation<
      'oneToMany',
      'api::evaluation.evaluation'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::evaluation-batch.evaluation-batch'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    school_year: Schema.Attribute.String;
    semester: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiEvaluationCriteriaEvaluationCriteria
  extends Struct.CollectionTypeSchema {
  collectionName: 'evaluation_criterias';
  info: {
    displayName: 'EvaluationCriteria';
    pluralName: 'evaluation-criterias';
    singularName: 'evaluation-criteria';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::evaluation-criteria.evaluation-criteria'
    > &
      Schema.Attribute.Private;
    order: Schema.Attribute.Integer;
    publishedAt: Schema.Attribute.DateTime;
    section: Schema.Attribute.Relation<
      'manyToOne',
      'api::evaluation-section.evaluation-section'
    >;
    statement: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiEvaluationResponseEvaluationResponse
  extends Struct.CollectionTypeSchema {
  collectionName: 'evaluation_responses';
  info: {
    displayName: 'EvaluationResponse';
    pluralName: 'evaluation-responses';
    singularName: 'evaluation-response';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::evaluation-response.evaluation-response'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    score: Schema.Attribute.Integer;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiEvaluationSectionEvaluationSection
  extends Struct.CollectionTypeSchema {
  collectionName: 'evaluation_sections';
  info: {
    displayName: 'EvaluationSection';
    pluralName: 'evaluation-sections';
    singularName: 'evaluation-section';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    evaluation_criteria: Schema.Attribute.Relation<
      'oneToMany',
      'api::evaluation-criteria.evaluation-criteria'
    >;
    evaluation_type: Schema.Attribute.Relation<
      'manyToOne',
      'api::evaluation-type.evaluation-type'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::evaluation-section.evaluation-section'
    > &
      Schema.Attribute.Private;
    order: Schema.Attribute.Integer;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiEvaluationTypeEvaluationType
  extends Struct.CollectionTypeSchema {
  collectionName: 'evaluation_types';
  info: {
    displayName: 'EvaluationType';
    pluralName: 'evaluation-types';
    singularName: 'evaluation-type';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    code: Schema.Attribute.UID<'name'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    evaluation_batches: Schema.Attribute.Relation<
      'oneToMany',
      'api::evaluation-batch.evaluation-batch'
    >;
    evaluation_sections: Schema.Attribute.Relation<
      'oneToMany',
      'api::evaluation-section.evaluation-section'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::evaluation-type.evaluation-type'
    > &
      Schema.Attribute.Private;
    max_score: Schema.Attribute.Integer;
    min_score: Schema.Attribute.Integer;
    name: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    scale_labels: Schema.Attribute.JSON;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiEvaluationEvaluation extends Struct.CollectionTypeSchema {
  collectionName: 'evaluations';
  info: {
    displayName: 'Evaluation';
    pluralName: 'evaluations';
    singularName: 'evaluation';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    areas_for_improvement: Schema.Attribute.Text;
    average_score: Schema.Attribute.Decimal;
    batch: Schema.Attribute.Relation<
      'manyToOne',
      'api::evaluation-batch.evaluation-batch'
    >;
    comment: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dean_coordinator: Schema.Attribute.Relation<
      'manyToOne',
      'api::teacher.teacher'
    >;
    effectiveness: Schema.Attribute.Text;
    evaluator_user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    feedback_keywords: Schema.Attribute.JSON;
    feedback_sentiment: Schema.Attribute.String;
    feedback_sentiment_score: Schema.Attribute.Decimal;
    feedback_sentiment_suggestion: Schema.Attribute.Text;
    feedback_sentiment_summary: Schema.Attribute.Text;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::evaluation.evaluation'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    responses: Schema.Attribute.JSON;
    strengths: Schema.Attribute.Text;
    subject: Schema.Attribute.Relation<'manyToOne', 'api::subject.subject'>;
    suggested_activities: Schema.Attribute.Text;
    teacher: Schema.Attribute.Relation<'manyToOne', 'api::teacher.teacher'>;
    total_score: Schema.Attribute.Integer;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiFacultyRankingBreakdownFacultyRankingBreakdown
  extends Struct.CollectionTypeSchema {
  collectionName: 'faculty_ranking_breakdowns';
  info: {
    displayName: 'Faculty Ranking Breakdown';
    pluralName: 'faculty-ranking-breakdowns';
    singularName: 'faculty-ranking-breakdown';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    awarded_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    base_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    calculation_notes: Schema.Attribute.Text;
    category_code: Schema.Attribute.Enumeration<
      [
        'educational_qualifications',
        'eligibility',
        'training_seminars',
        'research',
        'awards_recognition',
        'professional_experience',
        'loyalty',
        'evaluation',
        'corporate_social_responsibility',
      ]
    > &
      Schema.Attribute.Required;
    category_name: Schema.Attribute.String & Schema.Attribute.Required;
    computed_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    criterion_code: Schema.Attribute.String;
    criterion_name: Schema.Attribute.String;
    faculty_ranking: Schema.Attribute.Relation<
      'manyToOne',
      'api::faculty-ranking.faculty-ranking'
    > &
      Schema.Attribute.Required;
    is_included: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::faculty-ranking-breakdown.faculty-ranking-breakdown'
    > &
      Schema.Attribute.Private;
    maximum_points: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    multiplier: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    portfolio_entry: Schema.Attribute.Relation<
      'manyToOne',
      'api::portfolio-entry.portfolio-entry'
    >;
    publishedAt: Schema.Attribute.DateTime;
    quantity: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    ranking_category: Schema.Attribute.Relation<
      'manyToOne',
      'api::ranking-category.ranking-category'
    >;
    ranking_criterion: Schema.Attribute.Relation<
      'manyToOne',
      'api::ranking-criterion.ranking-criterion'
    >;
    raw_value: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    source_description: Schema.Attribute.Text;
    source_document_id: Schema.Attribute.String;
    source_title: Schema.Attribute.String;
    source_type: Schema.Attribute.Enumeration<
      [
        'portfolio_entry',
        'evaluation_result',
        'service_record',
        'manual_adjustment',
        'system_computation',
      ]
    > &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiFacultyRankingFacultyRanking
  extends Struct.CollectionTypeSchema {
  collectionName: 'faculty_rankings';
  info: {
    displayName: 'Faculty Ranking';
    pluralName: 'faculty-rankings';
    singularName: 'faculty-ranking';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    awards_recognition_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    breakdowns: Schema.Attribute.Relation<
      'oneToMany',
      'api::faculty-ranking-breakdown.faculty-ranking-breakdown'
    >;
    computation_status: Schema.Attribute.Enumeration<
      ['draft', 'computed', 'finalized', 'archived']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'draft'>;
    computed_at: Schema.Attribute.DateTime;
    computed_by: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    csr_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    educational_qualification_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    educational_qualification_total_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    eligibility_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    evaluation_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    finalized_at: Schema.Attribute.DateTime;
    hr_evaluation_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    immediate_superior_evaluation_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::faculty-ranking.faculty-ranking'
    > &
      Schema.Attribute.Private;
    loyalty_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    professional_experience_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    rank_band: Schema.Attribute.Relation<
      'manyToOne',
      'api::rank-band.rank-band'
    >;
    rank_code: Schema.Attribute.String;
    rank_name: Schema.Attribute.String;
    ranking_label: Schema.Attribute.String & Schema.Attribute.Required;
    ranking_no: Schema.Attribute.UID<'ranking_label'> &
      Schema.Attribute.Required;
    ranking_scheme: Schema.Attribute.Relation<
      'manyToOne',
      'api::ranking-scheme.ranking-scheme'
    > &
      Schema.Attribute.Required;
    rate_assignment_message: Schema.Attribute.String;
    rate_assignment_status: Schema.Attribute.Enumeration<
      ['matched', 'minimum_rate', 'not_configured']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'not_configured'>;
    remarks: Schema.Attribute.Text;
    research_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    salary_rate: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    salary_rate_record: Schema.Attribute.Relation<
      'manyToOne',
      'api::salary-rate.salary-rate'
    >;
    school_year: Schema.Attribute.String & Schema.Attribute.Required;
    semester: Schema.Attribute.String & Schema.Attribute.Required;
    student_evaluation_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    teacher: Schema.Attribute.Relation<'manyToOne', 'api::teacher.teacher'> &
      Schema.Attribute.Required;
    total_portfolio_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    total_ranking_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    training_seminar_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiOverallFeedbackOverallFeedback
  extends Struct.CollectionTypeSchema {
  collectionName: 'overall_feedbacks';
  info: {
    displayName: 'Overall Feedback';
    pluralName: 'overall-feedbacks';
    singularName: 'overall-feedback';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    course: Schema.Attribute.Relation<'manyToOne', 'api::course.course'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.Date;
    evaluator_user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::overall-feedback.overall-feedback'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    responses: Schema.Attribute.JSON;
    school_year: Schema.Attribute.String;
    school_year_record: Schema.Attribute.Relation<
      'manyToOne',
      'api::school-year.school-year'
    >;
    semester: Schema.Attribute.String;
    student: Schema.Attribute.Relation<'manyToOne', 'api::student.student'>;
    subject: Schema.Attribute.Relation<'manyToOne', 'api::subject.subject'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPortfolioEntryPortfolioEntry
  extends Struct.CollectionTypeSchema {
  collectionName: 'portfolio_entries';
  info: {
    displayName: 'Portfolio Entry';
    pluralName: 'portfolio-entries';
    singularName: 'portfolio-entry';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date_earned: Schema.Attribute.Date;
    description: Schema.Attribute.Text;
    end_date: Schema.Attribute.Date;
    entry_type: Schema.Attribute.Enumeration<
      [
        'educational_qualifications',
        'eligibility',
        'training_seminars',
        'research',
        'awards_recognition',
        'professional_experience',
        'loyalty',
        'evaluation',
        'corporate_social_responsibility',
      ]
    > &
      Schema.Attribute.Required;
    expiration_date: Schema.Attribute.Date;
    institution: Schema.Attribute.String;
    is_current: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    issuer: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::portfolio-entry.portfolio-entry'
    > &
      Schema.Attribute.Private;
    points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    ranking_breakdowns: Schema.Attribute.Relation<
      'oneToMany',
      'api::faculty-ranking-breakdown.faculty-ranking-breakdown'
    >;
    reference_number: Schema.Attribute.String;
    remarks: Schema.Attribute.Text;
    school_year: Schema.Attribute.String;
    semester: Schema.Attribute.String;
    start_date: Schema.Attribute.Date;
    teacher: Schema.Attribute.Relation<'manyToOne', 'api::teacher.teacher'> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    years_count: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
  };
}

export interface ApiRankBandRankBand extends Struct.CollectionTypeSchema {
  collectionName: 'rank_bands';
  info: {
    displayName: 'Rank Band';
    pluralName: 'rank-bands';
    singularName: 'rank-band';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    educational_requirement: Schema.Attribute.String;
    faculty_rankings: Schema.Attribute.Relation<
      'oneToMany',
      'api::faculty-ranking.faculty-ranking'
    >;
    is_active: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::rank-band.rank-band'
    > &
      Schema.Attribute.Private;
    maximum_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    maximum_rate: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    minimum_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    minimum_rate: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    rank_level: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    rank_name: Schema.Attribute.Enumeration<
      ['instructor', 'assistant_professor', 'associate_professor', 'professor']
    > &
      Schema.Attribute.Required;
    ranking_scheme: Schema.Attribute.Relation<
      'manyToOne',
      'api::ranking-scheme.ranking-scheme'
    > &
      Schema.Attribute.Required;
    rate_steps: Schema.Attribute.Relation<
      'oneToMany',
      'api::rate-step.rate-step'
    >;
    salary_rate_record: Schema.Attribute.Relation<
      'oneToOne',
      'api::salary-rate.salary-rate'
    >;
    sequence: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiRankingCategoryRankingCategory
  extends Struct.CollectionTypeSchema {
  collectionName: 'ranking_categories';
  info: {
    displayName: 'Ranking Category';
    pluralName: 'ranking-categories';
    singularName: 'ranking-category';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    calculation_method: Schema.Attribute.Enumeration<
      ['fixed', 'accumulated', 'capped', 'calculated', 'evaluation']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'accumulated'>;
    code: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    criteria: Schema.Attribute.Relation<
      'oneToMany',
      'api::ranking-criterion.ranking-criterion'
    >;
    description: Schema.Attribute.Text;
    is_active: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::ranking-category.ranking-category'
    > &
      Schema.Attribute.Private;
    maximum_points: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    ranking_scheme: Schema.Attribute.Relation<
      'manyToOne',
      'api::ranking-scheme.ranking-scheme'
    > &
      Schema.Attribute.Required;
    requires_evidence: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    sequence: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiRankingCriterionRankingCriterion
  extends Struct.CollectionTypeSchema {
  collectionName: 'ranking_criteria';
  info: {
    displayName: 'Ranking Criterion';
    pluralName: 'ranking-criteria';
    singularName: 'ranking-criterion';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    calculation_type: Schema.Attribute.Enumeration<
      [
        'fixed',
        'per_item',
        'range',
        'years_of_service',
        'evaluation_conversion',
        'manual',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'fixed'>;
    category: Schema.Attribute.Relation<
      'manyToOne',
      'api::ranking-category.ranking-category'
    > &
      Schema.Attribute.Required;
    code: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    evidence_type: Schema.Attribute.Enumeration<
      [
        'diploma',
        'transcript',
        'license',
        'certificate',
        'publication',
        'award',
        'employment_record',
        'community_service_record',
        'evaluation_result',
        'other',
      ]
    >;
    is_active: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    is_repeatable: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::ranking-criterion.ranking-criterion'
    > &
      Schema.Attribute.Private;
    maximum_points: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    maximum_quantity: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    maximum_value: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    minimum_quantity: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    minimum_value: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    points_per_item: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    requires_evidence: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    sequence: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiRankingCycleRankingCycle
  extends Struct.CollectionTypeSchema {
  collectionName: 'ranking_cycles';
  info: {
    displayName: 'Ranking Cycle';
    pluralName: 'ranking-cycles';
    singularName: 'ranking-cycle';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    code: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    cycle_status: Schema.Attribute.Enumeration<
      [
        'draft',
        'open',
        'for_validation',
        'for_committee_review',
        'approved',
        'published',
        'archived',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'draft'>;
    effective_date: Schema.Attribute.Date;
    end_date: Schema.Attribute.Date & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::ranking-cycle.ranking-cycle'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    ranking_scheme: Schema.Attribute.Relation<
      'manyToOne',
      'api::ranking-scheme.ranking-scheme'
    > &
      Schema.Attribute.Required;
    remarks: Schema.Attribute.Text;
    school_year: Schema.Attribute.String & Schema.Attribute.Required;
    start_date: Schema.Attribute.Date & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiRankingSchemeRankingScheme
  extends Struct.CollectionTypeSchema {
  collectionName: 'ranking_schemes';
  info: {
    displayName: 'Ranking Scheme';
    pluralName: 'ranking-schemes';
    singularName: 'ranking-scheme';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    academic_year: Schema.Attribute.String & Schema.Attribute.Required;
    categories: Schema.Attribute.Relation<
      'oneToMany',
      'api::ranking-category.ranking-category'
    >;
    code: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    effective_date: Schema.Attribute.Date & Schema.Attribute.Required;
    evaluation_max_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<13>;
    expiration_date: Schema.Attribute.Date;
    faculty_rankings: Schema.Attribute.Relation<
      'oneToMany',
      'api::faculty-ranking.faculty-ranking'
    >;
    hr_evaluation_max_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<4>;
    immediate_superior_max_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<4>;
    is_active: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::ranking-scheme.ranking-scheme'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    rank_bands: Schema.Attribute.Relation<
      'oneToMany',
      'api::rank-band.rank-band'
    >;
    ranking_cycles: Schema.Attribute.Relation<
      'oneToMany',
      'api::ranking-cycle.ranking-cycle'
    >;
    remarks: Schema.Attribute.Text;
    salary_rates: Schema.Attribute.Relation<
      'oneToMany',
      'api::salary-rate.salary-rate'
    >;
    scheme_status: Schema.Attribute.Enumeration<
      ['draft', 'active', 'archived']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'draft'>;
    student_evaluation_max_points: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    total_max_points: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    version: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ApiRateStepRateStep extends Struct.CollectionTypeSchema {
  collectionName: 'rate_steps';
  info: {
    displayName: 'Rate Step';
    pluralName: 'rate-steps';
    singularName: 'rate-step';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    is_active: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::rate-step.rate-step'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    rank_band: Schema.Attribute.Relation<
      'manyToOne',
      'api::rank-band.rank-band'
    > &
      Schema.Attribute.Required;
    rate: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    step_number: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 1;
        },
        number
      >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiRefreshTokenRefreshToken
  extends Struct.CollectionTypeSchema {
  collectionName: 'refresh_tokens';
  info: {
    displayName: 'RefreshToken';
    pluralName: 'refresh-tokens';
    singularName: 'refresh-token';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    expiresAt: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::refresh-token.refresh-token'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiSalaryRateSalaryRate extends Struct.CollectionTypeSchema {
  collectionName: 'salary_rates';
  info: {
    displayName: 'Salary Rate';
    pluralName: 'salary-rates';
    singularName: 'salary-rate';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    below_points: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    effective_date: Schema.Attribute.Date;
    end_date: Schema.Attribute.Date;
    faculty_rankings: Schema.Attribute.Relation<
      'oneToMany',
      'api::faculty-ranking.faculty-ranking'
    >;
    is_active: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    is_below_minimum: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::salary-rate.salary-rate'
    > &
      Schema.Attribute.Private;
    max_rate: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    point_value: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    ranking_scheme: Schema.Attribute.Relation<
      'manyToOne',
      'api::ranking-scheme.ranking-scheme'
    > &
      Schema.Attribute.Required;
    rate_code: Schema.Attribute.UID<'rate_name'> & Schema.Attribute.Required;
    rate_name: Schema.Attribute.String & Schema.Attribute.Required;
    remarks: Schema.Attribute.Text;
    sort_order: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiScaleOptionScaleOption extends Struct.CollectionTypeSchema {
  collectionName: 'scale_options';
  info: {
    displayName: 'ScaleOption';
    pluralName: 'scale-options';
    singularName: 'scale-option';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    label: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::scale-option.scale-option'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    value: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface ApiSchoolYearSchoolYear extends Struct.CollectionTypeSchema {
  collectionName: 'school_years';
  info: {
    displayName: 'School Year';
    pluralName: 'school-years';
    singularName: 'school-year';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    active_sy: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::school-year.school-year'
    > &
      Schema.Attribute.Private;
    overall_feedbacks: Schema.Attribute.Relation<
      'oneToMany',
      'api::overall-feedback.overall-feedback'
    >;
    publishedAt: Schema.Attribute.DateTime;
    school_year: Schema.Attribute.String;
    semester: Schema.Attribute.String;
    sy_status: Schema.Attribute.Enumeration<['Active', 'Inactive']> &
      Schema.Attribute.DefaultTo<'Inactive'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiStudentStudent extends Struct.CollectionTypeSchema {
  collectionName: 'students';
  info: {
    displayName: 'Student';
    pluralName: 'students';
    singularName: 'student';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    assigned_teachers: Schema.Attribute.Relation<
      'manyToMany',
      'api::teacher.teacher'
    >;
    course: Schema.Attribute.Relation<'manyToOne', 'api::course.course'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::student.student'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    overall_feedbacks: Schema.Attribute.Relation<
      'oneToMany',
      'api::overall-feedback.overall-feedback'
    >;
    publishedAt: Schema.Attribute.DateTime;
    section: Schema.Attribute.String;
    student_id: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    year_level: Schema.Attribute.String;
  };
}

export interface ApiSubjectSubject extends Struct.CollectionTypeSchema {
  collectionName: 'subjects';
  info: {
    displayName: 'Subject';
    pluralName: 'subjects';
    singularName: 'subject';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    code: Schema.Attribute.String;
    course: Schema.Attribute.Relation<'manyToOne', 'api::course.course'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    evaluations: Schema.Attribute.Relation<
      'oneToMany',
      'api::evaluation.evaluation'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::subject.subject'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    overall_feedbacks: Schema.Attribute.Relation<
      'oneToMany',
      'api::overall-feedback.overall-feedback'
    >;
    publishedAt: Schema.Attribute.DateTime;
    teachers: Schema.Attribute.Relation<'manyToMany', 'api::teacher.teacher'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTeacherTeacher extends Struct.CollectionTypeSchema {
  collectionName: 'teachers';
  info: {
    displayName: 'Teacher';
    pluralName: 'teachers';
    singularName: 'teacher';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    assigned_subjects: Schema.Attribute.Relation<
      'manyToMany',
      'api::subject.subject'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dean_evaluations: Schema.Attribute.Relation<
      'oneToMany',
      'api::evaluation.evaluation'
    >;
    department: Schema.Attribute.Relation<
      'manyToOne',
      'api::department.department'
    >;
    employee_no: Schema.Attribute.String;
    faculty_rankings: Schema.Attribute.Relation<
      'oneToMany',
      'api::faculty-ranking.faculty-ranking'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::teacher.teacher'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    portfolio_entries: Schema.Attribute.Relation<
      'oneToMany',
      'api::portfolio-entry.portfolio-entry'
    >;
    publishedAt: Schema.Attribute.DateTime;
    students: Schema.Attribute.Relation<'manyToMany', 'api::student.student'>;
    teacher_evaluations: Schema.Attribute.Relation<
      'oneToMany',
      'api::evaluation.evaluation'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiUserInfoUserInfo extends Struct.CollectionTypeSchema {
  collectionName: 'user_infos';
  info: {
    displayName: 'UserInfo';
    pluralName: 'user-infos';
    singularName: 'user-info';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    department: Schema.Attribute.String;
    employee_no: Schema.Attribute.String & Schema.Attribute.Unique;
    first_name: Schema.Attribute.String;
    last_name: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-info.user-info'
    > &
      Schema.Attribute.Private;
    middle_name: Schema.Attribute.String;
    position: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users_permissions_user: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginContentReleasesRelease
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    releasedAt: Schema.Attribute.DateTime;
    scheduledAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Schema.Attribute.Required;
    timezone: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    entryDocumentId: Schema.Attribute.String;
    isEntryValid: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    release: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Schema.Attribute.Enumeration<['publish', 'unpublish']> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::i18n.locale'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflow
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows';
  info: {
    description: '';
    displayName: 'Workflow';
    name: 'Workflow';
    pluralName: 'workflows';
    singularName: 'workflow';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentTypes: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    stageRequiredToPublish: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::review-workflows.workflow-stage'
    >;
    stages: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflowStage
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages';
  info: {
    description: '';
    displayName: 'Stages';
    name: 'Workflow Stage';
    pluralName: 'workflow-stages';
    singularName: 'workflow-stage';
  };
  options: {
    draftAndPublish: false;
    version: '1.1.0';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    permissions: Schema.Attribute.Relation<'manyToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    workflow: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::review-workflows.workflow'
    >;
  };
}

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Schema.Attribute.Text;
    caption: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ext: Schema.Attribute.String;
    focalPoint: Schema.Attribute.JSON;
    folder: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'> &
      Schema.Attribute.Private;
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    formats: Schema.Attribute.JSON;
    hash: Schema.Attribute.String & Schema.Attribute.Required;
    height: Schema.Attribute.Integer;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.file'
    > &
      Schema.Attribute.Private;
    mime: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    previewUrl: Schema.Attribute.Text;
    provider: Schema.Attribute.String & Schema.Attribute.Required;
    provider_metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    related: Schema.Attribute.Relation<'morphToMany'>;
    size: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.Text & Schema.Attribute.Required;
    width: Schema.Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.folder'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>;
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    pathId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.role'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    evaluations: Schema.Attribute.Relation<
      'oneToMany',
      'api::evaluation.evaluation'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Private;
    overall_feedbacks: Schema.Attribute.Relation<
      'oneToMany',
      'api::overall-feedback.overall-feedback'
    >;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    refresh_tokens: Schema.Attribute.Relation<
      'oneToMany',
      'api::refresh-token.refresh-token'
    >;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    student: Schema.Attribute.Relation<'oneToOne', 'api::student.student'>;
    teacher: Schema.Attribute.Relation<'oneToOne', 'api::teacher.teacher'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user_info: Schema.Attribute.Relation<
      'oneToOne',
      'api::user-info.user-info'
    >;
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ContentTypeSchemas {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::session': AdminSession;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::course.course': ApiCourseCourse;
      'api::department.department': ApiDepartmentDepartment;
      'api::evaluation-batch.evaluation-batch': ApiEvaluationBatchEvaluationBatch;
      'api::evaluation-criteria.evaluation-criteria': ApiEvaluationCriteriaEvaluationCriteria;
      'api::evaluation-response.evaluation-response': ApiEvaluationResponseEvaluationResponse;
      'api::evaluation-section.evaluation-section': ApiEvaluationSectionEvaluationSection;
      'api::evaluation-type.evaluation-type': ApiEvaluationTypeEvaluationType;
      'api::evaluation.evaluation': ApiEvaluationEvaluation;
      'api::faculty-ranking-breakdown.faculty-ranking-breakdown': ApiFacultyRankingBreakdownFacultyRankingBreakdown;
      'api::faculty-ranking.faculty-ranking': ApiFacultyRankingFacultyRanking;
      'api::overall-feedback.overall-feedback': ApiOverallFeedbackOverallFeedback;
      'api::portfolio-entry.portfolio-entry': ApiPortfolioEntryPortfolioEntry;
      'api::rank-band.rank-band': ApiRankBandRankBand;
      'api::ranking-category.ranking-category': ApiRankingCategoryRankingCategory;
      'api::ranking-criterion.ranking-criterion': ApiRankingCriterionRankingCriterion;
      'api::ranking-cycle.ranking-cycle': ApiRankingCycleRankingCycle;
      'api::ranking-scheme.ranking-scheme': ApiRankingSchemeRankingScheme;
      'api::rate-step.rate-step': ApiRateStepRateStep;
      'api::refresh-token.refresh-token': ApiRefreshTokenRefreshToken;
      'api::salary-rate.salary-rate': ApiSalaryRateSalaryRate;
      'api::scale-option.scale-option': ApiScaleOptionScaleOption;
      'api::school-year.school-year': ApiSchoolYearSchoolYear;
      'api::student.student': ApiStudentStudent;
      'api::subject.subject': ApiSubjectSubject;
      'api::teacher.teacher': ApiTeacherTeacher;
      'api::user-info.user-info': ApiUserInfoUserInfo;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow;
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
