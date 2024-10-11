-- Core System Tables
CREATE TABLE Modules (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Module_Dynamic_Fields (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES Modules(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL, -- e.g., text, number, date, dropdown
    is_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Module_Settings (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES Modules(id) ON DELETE CASCADE,
    setting_key TEXT NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Management Tables
CREATE TABLE Workflows (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES Modules(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Workflow_Steps (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES Workflows(id) ON DELETE CASCADE,
    step_name TEXT NOT NULL,
    step_order INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Workflow_Transitions (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES Workflows(id) ON DELETE CASCADE,
    from_step_id UUID REFERENCES Workflow_Steps(id) ON DELETE CASCADE,
    to_step_id UUID REFERENCES Workflow_Steps(id) ON DELETE CASCADE,
    transition_condition TEXT, -- e.g., "priority = 'High'"
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Workflow_Conditions (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES Workflows(id) ON DELETE CASCADE,
    condition_expression TEXT, -- e.g., "ticket.priority = 'High'"
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Workflow_Actions (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES Workflows(id) ON DELETE CASCADE,
    action_description TEXT, -- e.g., "Send notification"
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Workflow_Events (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES Workflows(id) ON DELETE CASCADE,
    event_description TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ticket Management Tables
CREATE TABLE Tickets (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES Modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    priority TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE Ticket_Dynamic_Field_Values (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES Tickets(id) ON DELETE CASCADE,
    field_id UUID REFERENCES Module_Dynamic_Fields(id) ON DELETE CASCADE,
    field_value TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Ticket_Status_History (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES Tickets(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Ticket_Attachments (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES Tickets(id) ON DELETE CASCADE,
    file_path TEXT,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Ticket_Comments (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES Tickets(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Ticket_Relationships (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES Tickets(id) ON DELETE CASCADE,
    related_ticket_id UUID REFERENCES Tickets(id) ON DELETE CASCADE,
    relationship_type TEXT, -- e.g., "linked", "duplicate"
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Time Tracking and SLA Management Tables
CREATE TABLE Time_Entries (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES Tickets(id) ON DELETE CASCADE,
    workflow_step_id UUID REFERENCES Workflow_Steps(id) ON DELETE CASCADE,
    time_spent INTERVAL NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE SLA_Policies (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES Modules(id) ON DELETE CASCADE,
    target_response_time INTERVAL,
    target_resolution_time INTERVAL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Ticket_SLA_Status (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES Tickets(id) ON DELETE CASCADE,
    sla_policy_id UUID REFERENCES SLA_Policies(id),
    is_within_sla BOOLEAN DEFAULT TRUE,
    breach_time TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Escalation_Rules (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES Modules(id) ON DELETE CASCADE,
    escalation_condition TEXT, -- e.g., "SLA breached"
    action TEXT, -- e.g., "notify supervisor"
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Escalation_Events (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES Tickets(id) ON DELETE CASCADE,
    escalation_rule_id UUID REFERENCES Escalation_Rules(id),
    escalation_action TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge Base Tables
CREATE TABLE Knowledge_Base_Articles (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    format TEXT NOT NULL, -- e.g., "pdf", "image", "text", "video"
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Knowledge_Base_Categories (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Article_Attachments (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES Knowledge_Base_Articles(id) ON DELETE CASCADE,
    file_path TEXT,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Article_Feedback (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES Knowledge_Base_Articles(id) ON DELETE CASCADE,
    rating INT,
    feedback TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- External Integrations Tables
CREATE TABLE External_Integrations (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    api_url TEXT NOT NULL,
    api_key TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Integration_Settings (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES External_Integrations(id) ON DELETE CASCADE,
    setting_key TEXT NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Integration_Events (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES External_Integrations(id) ON DELETE CASCADE,
    event_description TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Asset and Configuration Management Tables
CREATE TABLE Assets (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    asset_type TEXT NOT NULL, -- e.g., "hardware", "software"
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Asset_Relationships (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES Assets(id) ON DELETE CASCADE,
    related_asset_id UUID REFERENCES Assets(id) ON DELETE CASCADE,
    relationship_type TEXT, -- e.g., "dependency", "group"
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Configuration_Items (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    configuration_type TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE CI_Relationships (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    configuration_item_id UUID REFERENCES Configuration_Items(id) ON DELETE CASCADE,
    related_item_id UUID REFERENCES Configuration_Items(id) ON DELETE CASCADE,
    relationship_type TEXT, -- e.g., "dependency", "group"
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Service Catalog Tables
CREATE TABLE Service_Catalog_Items (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Service_Requests (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    catalog_item_id UUID REFERENCES Service_Catalog_Items(id) ON DELETE CASCADE,
    user_id UUID, -- User info will be passed in context
    request_details TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Service_Level_Definitions (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    catalog_item_id UUID REFERENCES Service_Catalog_Items(id) ON DELETE CASCADE,
    service_level TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Self-Service Portal Tables
CREATE TABLE Portal_Settings (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE User_Submissions (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    submission_type TEXT, -- e.g., "ticket", "feedback"
    submission_details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notification and Messaging Tables
CREATE TABLE Notifications (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES Modules(id) ON DELETE CASCADE,
    notification_template TEXT,
    notification_event TEXT, -- e.g., "ticket_created", "sla_breached"
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Notification_Logs (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES Notifications(id),
    recipient TEXT,
    delivery_status TEXT, -- e.g., "delivered", "failed"
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Message_Queue (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    message TEXT,
    recipient TEXT,
    status TEXT, -- e.g., "pending", "sent"
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audit and Logging Tables
CREATE TABLE Audit_Logs (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    entity_type TEXT, -- e.g., "ticket", "workflow"
    entity_id UUID,
    action TEXT, -- e.g., "created", "updated", "deleted"
    performed_by UUID, -- User ID or system context
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Change_History (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    entity_type TEXT, -- e.g., "ticket", "asset"
    entity_id UUID,
    previous_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Miscellaneous Tables
CREATE TABLE Templates (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    template_type TEXT NOT NULL, -- e.g., "ticket_response", "article"
    template_content TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Macros (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    macro_name TEXT NOT NULL,
    macro_actions TEXT, -- JSON or text defining the sequence of actions
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Search_Index (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    entity_type TEXT, -- e.g., "ticket", "article"
    entity_id UUID,
    search_content TSVECTOR, -- Full-text search vector
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Documents (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    version TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE HR_Requests (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    request_type TEXT NOT NULL, -- e.g., leave, payroll, benefits
    user_id UUID, -- User info passed via context
    details TEXT,
    status TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Channels (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    api_key TEXT UNIQUE NOT NULL,
    allowed_operations TEXT[], -- List of operations the channel is allowed to perform
    status TEXT NOT NULL DEFAULT 'active', -- active, disabled
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE API_Keys (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES Channels(id) ON DELETE CASCADE,
    api_key TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, revoked
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Channel_Requests (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES Channels(id) ON DELETE CASCADE,
    request_body JSONB, -- Store the request details
    jira_request_url TEXT, -- Jira endpoint URL
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
    response_body JSONB, -- Jira's response
    error_message TEXT, -- Any error encountered
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE TABLE Integration_Logs (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES Channels(id) ON DELETE CASCADE,
    jira_url TEXT, -- Jira endpoint URL
    request_body JSONB,
    response_body JSONB,
    status TEXT NOT NULL DEFAULT 'success', -- success, failure
    error_message TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE Channel_Requests ADD COLUMN retries INT DEFAULT 0;
CREATE TABLE Workflow_Execution_Log (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES Workflows(id) ON DELETE CASCADE,
    request_id UUID REFERENCES Channel_Requests(id) ON DELETE CASCADE,
    step_name TEXT NOT NULL,
    status TEXT NOT NULL, -- success, failed, retrying
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE Workflow_Execution_Log ADD COLUMN current_step INT DEFAULT 0;

